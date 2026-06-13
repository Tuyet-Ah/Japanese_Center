from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from education.models import AdminActivityLog


def _is_admin(user):
    return user.is_authenticated and user.role == 'admin' and not user.is_admin_pending


class AdminActivityLogView(APIView):
    """
    GET /educations/admin/activity-log/
    Trả về lịch sử hoạt động của admin đang đăng nhập.
    Query params:
        ?limit=50   (mặc định 50, tối đa 200)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not _is_admin(request.user):
            return Response({'error': 'Không có quyền.'}, status=status.HTTP_403_FORBIDDEN)

        limit = min(int(request.query_params.get('limit', 50)), 200)
        logs = AdminActivityLog.objects.filter(admin=request.user).order_by('-timestamp')[:limit]

        ACTION_LABELS = {
            'approve_user':   'Duyệt tài khoản',
            'reject_user':    'Từ chối tài khoản',
            'create_course':  'Thêm khóa học',
            'update_course':  'Sửa khóa học',
            'delete_course':  'Xóa khóa học',
            'create_chapter': 'Thêm chương',
            'update_chapter': 'Sửa chương',
            'delete_chapter': 'Xóa chương',
            'create_exam':    'Thêm đề thi',
            'update_exam':    'Sửa đề thi',
            'delete_exam':    'Xóa đề thi',
            'approve_topic':  'Duyệt bài thảo luận',
            'reject_topic':   'Từ chối bài thảo luận',
        }

        ACTION_ICONS = {
            'approve_user':   '👤',
            'reject_user':    '🚫',
            'create_course':  '📚',
            'update_course':  '✏️',
            'delete_course':  '🗑️',
            'create_chapter': '📖',
            'update_chapter': '✏️',
            'delete_chapter': '🗑️',
            'create_exam':    '📝',
            'update_exam':    '✏️',
            'delete_exam':    '🗑️',
            'approve_topic':  '💬',
            'reject_topic':   '🚫',
        }

        data = [
            {
                'id':           log.pk,
                'action_type':  log.action_type,
                'action_label': ACTION_LABELS.get(log.action_type, log.action_type),
                'action_icon':  ACTION_ICONS.get(log.action_type, '⚙️'),
                'target':       log.target_description,
                'status':       log.status,
                'timestamp':    log.timestamp.strftime('%d/%m/%Y %H:%M'),
            }
            for log in logs
        ]
        return Response(data)
