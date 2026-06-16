from education.models import AdminActivityLog

def log_admin_action(admin_user, action_type: str, target_description: str = '', status: str = 'success'):
    try:
        AdminActivityLog.objects.create(
            admin=admin_user,
            action_type=action_type,
            target_description=str(target_description)[:255],
            status=status,
        )
    except Exception:
        pass  # Log thất bại không được làm hỏng response
