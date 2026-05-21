from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from education.services import AuthService
from education.serializers import UserSerializer, CustomTokenSerializer,UserProfileSerializer
from education.models import Course, Quiz

User = get_user_model()

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

    def delete(self, request, user_id):
        if request.user.role != 'admin' or request.user.is_admin_pending:
            return Response({"error": "Không có quyền xóa tài khoản"}, status=403)

        target = User.objects.filter(id=user_id, role='admin', is_admin_pending=True).first()
        if not target:
            return Response({"error": "Không tìm thấy tài khoản cần xóa"}, status=404)

        target.delete()
        return Response({"message": "Đã xóa tài khoản"}, status=200)

class PendingAdminListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin' or request.user.is_admin_pending:
            return Response({"error": "Không có quyền xem danh sách chờ duyệt"}, status=403)

        pending_admins = User.objects.filter(role='admin', is_admin_pending=True).order_by('-id')
        return Response(UserSerializer(pending_admins, many=True).data)


class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin' or request.user.is_admin_pending:
            return Response({"error": "Không có quyền xem thống kê"}, status=403)

        total_courses = Course.objects.count()
        total_students = User.objects.filter(role='student').count()
        total_quizzes = Quiz.objects.count()
        pending_admins = User.objects.filter(role='admin', is_admin_pending=True).count()

        return Response({
            "total_courses": total_courses,
            "total_students": total_students,
            "total_quizzes": total_quizzes,
            "pending_admins": pending_admins
        })

# Quản lý thông tin các nhân và avatar
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        user = AuthService.update_profile(request.user, request.data, request.FILES)
        return Response(UserProfileSerializer(user, context={'request': request}).data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = AuthService.change_password(request.user, request.data)
            return Response({"message": "Đổi mật khẩu thành công"})
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

class LogoutView(APIView):
    def post(self, request):
        try:
            AuthService.logout_user(request.data.get('refresh'))
            return Response({"message": "Đã đăng xuất"}, status=200)
        except Exception:
            return Response({"error": "Token không hợp lệ"}, status=400)