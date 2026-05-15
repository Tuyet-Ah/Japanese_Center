from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
User = get_user_model()

class AuthService:
    @staticmethod
    def register_user(data):
        """Logic đăng ký người dùng mới"""
        if User.objects.filter(username=data.get('username')).exists():
            raise ValueError("Tên đăng nhập đã tồn tại")
        if data.get('email') and User.objects.filter(email=data.get('email')).exists():
            raise ValueError("Email đã tồn tại")
        if data.get('phone') and User.objects.filter(phone=data.get('phone')).exists():
            raise ValueError("Số điện thoại đã tồn tại")
            
        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email'),
            role='student',
            phone=data.get('phone'),
            address=data.get('address')
        )
        return user

    @staticmethod
    def register_admin(data):
        if User.objects.filter(username=data.get('username')).exists():
            raise ValueError("Tên đăng nhập đã tồn tại")
        if data.get('email') and User.objects.filter(email=data.get('email')).exists():
            raise ValueError("Email đã tồn tại")
        if data.get('phone') and User.objects.filter(phone=data.get('phone')).exists():
            raise ValueError("Số điện thoại đã tồn tại")

        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password'),
            email=data.get('email'),
            role='admin',
            phone=data.get('phone'),
            address=data.get('address')
        )
        user.is_admin_pending = True
        user.is_staff = False
        user.is_superuser = False
        user.save(update_fields=['is_admin_pending', 'is_staff', 'is_superuser'])
        return user

    @staticmethod
    def approve_admin(user_id, approver):
        if approver.role != 'admin' or approver.is_admin_pending:
            raise ValueError("Không có quyền duyệt admin")

        target = User.objects.filter(id=user_id, role='admin').first()
        if not target:
            raise ValueError("Không tìm thấy tài khoản admin")

        target.is_admin_pending = False
        target.is_staff = True
        target.save(update_fields=['is_admin_pending', 'is_staff'])
        return target
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