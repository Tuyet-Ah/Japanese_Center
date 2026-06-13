"""
activity_log_service.py — Ghi nhật ký hoạt động của admin.

Cách dùng trong view:
    from education.services.activity_log_service import log_admin_action
    log_admin_action(request.user, 'create_course', course.title)
"""

from education.models import AdminActivityLog


def log_admin_action(admin_user, action_type: str, target_description: str = '', status: str = 'success'):
    """
    Tạo một bản ghi AdminActivityLog.
    Bắt mọi exception để không bao giờ làm crash view chính.
    """
    try:
        AdminActivityLog.objects.create(
            admin=admin_user,
            action_type=action_type,
            target_description=str(target_description)[:255],
            status=status,
        )
    except Exception:
        pass  # Log thất bại không được làm hỏng response
