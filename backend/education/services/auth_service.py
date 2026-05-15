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
        email = data.get('email', user.email)
        if email != user.email and User.objects.exclude(id=user.id).filter(email=email).exists():
            raise ValueError("Email đã tồn tại")

        phone = data.get('phone', user.phone)
        if phone != user.phone and phone and User.objects.exclude(id=user.id).filter(phone=phone).exists():
            raise ValueError("Số điện thoại đã tồn tại")

        full_name = data.get('full_name', '').strip()
        if full_name:
            first_name, _, last_name = full_name.partition(' ')
            user.first_name = first_name
            user.last_name = last_name

        user.email = email
        user.phone = data.get('phone', user.phone)
        user.address = data.get('address', user.address)
        if 'avatar' in files:
            user.avatar = files['avatar']
        user.save()
        return user

    @staticmethod
    def change_password(user, data):
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')

        if not user.check_password(current_password):
            raise ValueError("Mật khẩu hiện tại không đúng")
        if len(new_password) < 6:
            raise ValueError("Mật khẩu mới phải có ít nhất 6 ký tự")

        user.set_password(new_password)
        user.save(update_fields=['password'])
        return user
    

    @staticmethod
    def logout_user(refresh_token):
        """Vô hiệu hóa Refresh Token (Cần cài đặt Blacklist app trong Django)"""
        token = RefreshToken(refresh_token)
        token.blacklist()