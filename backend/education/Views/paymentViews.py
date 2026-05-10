from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from education.services.payment_service import PaymentService


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            course_ids = request.data.get('course_ids', [])
            client_ip = request.META.get('REMOTE_ADDR')
            data = PaymentService.create_vnpay_payment(request.user, course_ids, client_ip)
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)


class VnpayReturnView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        success, message = PaymentService.handle_vnpay_result(request.query_params, is_ipn=False)
        if settings.VNPAY_FRONTEND_RETURN_URL:
            return redirect(f"{settings.VNPAY_FRONTEND_RETURN_URL}?status={message}")
        return Response({"status": "success" if success else "error", "message": message})


class VnpayIpnView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        success, message = PaymentService.handle_vnpay_result(request.query_params, is_ipn=True)
        return Response({"RspCode": "00" if success else "97", "Message": message})