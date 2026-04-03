from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from education.serializers import UserProfileSerializer
User = get_user_model()

class AuthService:
    @staticmethod
    def register_user(data):
        """Logic đăng ký người dùng mới"""
        if User.objects.filter(username=data.get('username')).exists():
            raise ValueError("Tên đăng nhập đã tồn tại")
            
        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email'),
            role=data.get('role', 'student'),
            phone=data.get('phone'),
            address=data.get('address')
        )
        return user
    #ypdate thông tin
    @staticmethod
    def update_profile(user, data, files):
        user.phone = data.get('phone', user.phone)
        user.address = data.get('address', user.address)
        if 'avatar' in files:
            user.avatar = files['avatar']
        user.save()
        return user
    

    @staticmethod
    def logout_user(refresh_token):
        """Vô hiệu hóa Refresh Token (Cần cài đặt Blacklist app trong Django)"""
        token = RefreshToken(refresh_token)
        token.blacklist()