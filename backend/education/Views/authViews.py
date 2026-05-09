from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import  permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from education.services import AuthService
from education.serializers import UserSerializer, CustomTokenSerializer,UserProfileSerializer

# --- AUTH ---
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        try:
            user = AuthService.register_user(request.data)
            return Response(UserSerializer(user).data, status=201)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

class RegisterAdminView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            user = AuthService.register_admin(request.data)
            return Response(UserSerializer(user).data, status=201)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

class ApproveAdminView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        try:
            user = AuthService.approve_admin(user_id, request.user)
            return Response(UserSerializer(user).data, status=200)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

# Quản lý thông tin các nhân và avatar
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = AuthService.update_profile(request.user, request.data, request.FILES)
        return Response(UserProfileSerializer(user).data)

class LogoutView(APIView):
    def post(self, request):
        try:
            AuthService.logout_user(request.data.get('refresh'))
            return Response({"message": "Đã đăng xuất"}, status=200)
        except Exception:
            return Response({"error": "Token không hợp lệ"}, status=400)