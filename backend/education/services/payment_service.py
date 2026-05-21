import hashlib
import hmac
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from education.models import CartItem, Enrollment, PaymentTransaction, PaymentTransactionItem


class PaymentService:
    @staticmethod
    def _build_vnpay_url(params):
        # Build query string and secure hash excluding vnp_SecureHash and vnp_SecureHashType
        filtered = {k: v for k, v in params.items() if k not in ['vnp_SecureHash', 'vnp_SecureHashType']}
        sorted_params = sorted(filtered.items())
        query_string = urlencode(sorted_params, safe='')
        hash_data = query_string
        secure_hash = hmac.new(
            settings.VNPAY_HASH_SECRET.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        return f"{settings.VNPAY_PAYMENT_URL}?{query_string}&vnp_SecureHash={secure_hash}"

    @staticmethod
    def _verify_vnpay_signature(params):
        secure_hash = params.get('vnp_SecureHash', '')
        if not secure_hash:
            return False

        filtered = {
            k: v for k, v in params.items()
            if k not in ['vnp_SecureHash', 'vnp_SecureHashType']
        }
        sorted_params = sorted(filtered.items())
        hash_data = urlencode(sorted_params, safe='')
        expected_hash = hmac.new(
            settings.VNPAY_HASH_SECRET.encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        return secure_hash.upper() == expected_hash.upper()

    @staticmethod
    @transaction.atomic
    def create_vnpay_payment(user, course_ids, client_ip):
        if not settings.VNPAY_TMN_CODE or not settings.VNPAY_HASH_SECRET:
            raise ValueError("Thieu cau hinh VNPAY_TMN_CODE hoac VNPAY_HASH_SECRET")

        items_to_buy = CartItem.objects.filter(user=user, course_id__in=course_ids).select_related('course')
        if not items_to_buy.exists():
            raise ValueError("Không tìm thấy khóa học hợp lệ trong giỏ")

        total_amount = sum(item.course.price for item in items_to_buy)
        for item in items_to_buy:
            enrollment, _ = Enrollment.objects.get_or_create(
                user=user,
                course=item.course,
                defaults={'status': 'pending'}
            )
            if enrollment.status != 'paid' and enrollment.status != 'pending':
                enrollment.status = 'pending'
                enrollment.save(update_fields=['status'])

        txn_ref = f"{timezone.now():%Y%m%d%H%M%S}{user.id}"
        order_info = f"JSMART ORDER {txn_ref}"
        payment = PaymentTransaction.objects.create(
            user=user,
            amount=total_amount,
            vnp_txn_ref=txn_ref,
            order_info=order_info,
            status='pending'
        )

        PaymentTransactionItem.objects.bulk_create([
            PaymentTransactionItem(
                payment=payment,
                course=item.course,
                amount=item.course.price,
            )
            for item in items_to_buy
        ])

        amount_vnd = int(total_amount * 100)
        now = timezone.localtime(timezone.now())
        params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': settings.VNPAY_TMN_CODE,
            'vnp_Amount': amount_vnd,
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': payment.vnp_txn_ref,
            'vnp_OrderInfo': order_info,
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': settings.VNPAY_RETURN_URL,
            'vnp_IpAddr': client_ip or '127.0.0.1',
            'vnp_CreateDate': now.strftime('%Y%m%d%H%M%S'),
            'vnp_ExpireDate': (now + timedelta(minutes=15)).strftime('%Y%m%d%H%M%S'),
        }

        payment_url = PaymentService._build_vnpay_url(params)
        return {
            'payment_url': payment_url,
            'txn_ref': payment.vnp_txn_ref,
            'amount': float(total_amount),
        }

    @staticmethod
    @transaction.atomic
    def handle_vnpay_result(params, is_ipn=False):
        if not PaymentService._verify_vnpay_signature(params):
            return False, 'invalid_signature'

        txn_ref = params.get('vnp_TxnRef', '')
        response_code = params.get('vnp_ResponseCode', '')
        transaction_status = params.get('vnp_TransactionStatus', '')

        try:
            payment = PaymentTransaction.objects.select_for_update().get(vnp_txn_ref=txn_ref)
        except PaymentTransaction.DoesNotExist:
            return False, 'transaction_not_found'

        payment.vnp_response_code = response_code
        payment.vnp_transaction_status = transaction_status

        success = response_code == '00' and (not is_ipn or transaction_status == '00')
        if success:
            if payment.status != 'success':
                payment.status = 'success'
                payment.paid_at = timezone.now()
                payment.save()

                course_ids = list(payment.items.values_list('course_id', flat=True))
                Enrollment.objects.filter(
                    user=payment.user,
                    course_id__in=course_ids,
                ).exclude(status='paid').update(status='paid')

                CartItem.objects.filter(user=payment.user, course_id__in=course_ids).delete()
            else:
                # Idempotent callback handling: ensure enrollment is paid even on repeated callbacks.
                course_ids = list(payment.items.values_list('course_id', flat=True))
                Enrollment.objects.filter(
                    user=payment.user,
                    course_id__in=course_ids,
                ).update(status='paid')
            return True, 'success'

        if not success and payment.status == 'pending':
            payment.status = 'failed'
            payment.save()
        return False, 'failed'