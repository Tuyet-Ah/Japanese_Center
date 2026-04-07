from django.db import transaction
from education.models import CartItem, Enrollment

class PaymentService:
    @staticmethod
    @transaction.atomic # Đảm bảo tính toàn vẹn: Xong hết hoặc không gì cả
    def create_checkout(user, course_ids):
        """Thanh toán từng phần từ giỏ hàng"""
        items_to_buy = CartItem.objects.filter(user=user, course_id__in=course_ids)
        if not items_to_buy.exists():
            raise ValueError("Không tìm thấy khóa học hợp lệ trong giỏ")

        checkout_data = []
        for item in items_to_buy:
            # 1. Tạo bản ghi Enrollment (Chờ thanh toán)
            enroll, _ = Enrollment.objects.get_or_create(user=user, course=item.course)
            
            # 2. Tạo link VietQR động
            bank_id = "MB" # MB Bank
            acc_no = "123456789" # Số tài khoản của bạn
            amount = int(item.course.price)
            memo = f"Thanh toán thành công cho JSMART{enroll.id}"
            qr_url = f"https://img.vietqr.io/image/{bank_id}-{acc_no}-compact.png?amount={amount}&addInfo={memo}"
            
            checkout_data.append({
                "course": item.course.title,
                "qr_code": qr_url,
                "memo": memo
            })

        # 3. Xóa các món đã chọn khỏi giỏ hàng
        items_to_buy.delete()
        return checkout_data

    @staticmethod
    def process_webhook(memo):
        """Tự động duyệt khóa học từ nội dung chuyển khoản"""
        try:
            # Ví dụ memo: "Chuyen khoan JSMART15" -> Lấy ra 15
            enroll_id = memo.upper().split("JSMART")[-1].strip()
            enrollment = Enrollment.objects.get(id=enroll_id)
            if enrollment.status == 'pending':
                enrollment.status = 'paid'
                enrollment.save()
                return enrollment
            return None
        except Exception:
            return None