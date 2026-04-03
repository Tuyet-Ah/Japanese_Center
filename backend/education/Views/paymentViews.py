from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import  permissions

from education.services.payment_service import PaymentService

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            data = PaymentService.create_checkout(request.user, request.data.get('course_ids', []))
            return Response(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

class WebhookBankView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        activated = PaymentService.process_webhook(request.data.get('description', ''))
        return Response({"status": "success"} if activated else {"status": "error"})