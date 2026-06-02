from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from education.serializers import LessonCommentSerializer, LessonNoteSerializer, ForumTopicSerializer,ForumResponseSerializer
from education.services import InteractionService, CourseService
from education.models import ForumTopic
class LessonCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, lesson_id):
        comments = InteractionService.get_lesson_comments(lesson_id)
        serializer = LessonCommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, lesson_id):
        content = request.data.get('content')
        comment = InteractionService.add_comment(request.user, lesson_id, content)
        return Response(LessonCommentSerializer(comment).data, status=status.HTTP_201_CREATED)

class PersonalNoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        lesson_id = request.query_params.get('lesson_id')
        notes = CourseService.get_notes(request.user, lesson_id)
        serializer = LessonNoteSerializer(notes, many=True)
        return Response(serializer.data)

    def post(self, request):
        note = InteractionService.upsert_note(
            request.user, 
            request.data.get('lesson_id'),
            request.data.get('content'),
            request.data.get('video_timestamp')
        )
        return Response(LessonNoteSerializer(note).data)


class LessonNoteDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, note_id):
        ok = CourseService.delete_note(request.user, note_id)
        if not ok:
            return Response({"error": "Không có quyền xóa ghi chú"}, status=status.HTTP_403_FORBIDDEN)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ForumTopicView(APIView):
    def get(self, request):
        topics = ForumTopic.objects.filter(is_approved=True).order_by('-created_at')
        return Response(ForumTopicSerializer(topics, many=True).data)
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Vui lòng đăng nhập"}, status=status.HTTP_401_UNAUTHORIZED)
        topic = InteractionService.create_topic(request.user, request.data)
        return Response(ForumTopicSerializer(topic).data, status=status.HTTP_201_CREATED)


class ForumTopicDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, topic_id):
        topic = ForumTopic.objects.filter(id=topic_id).first()
        if not topic:
            return Response({"error": "Chủ đề không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        if topic.user_id != request.user.id and request.user.role != 'admin':
            return Response({"error": "Không có quyền chỉnh sửa chủ đề"}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title', '').strip()
        content = request.data.get('content', '').strip()
        if not title or not content:
            return Response({"error": "Tiêu đề và nội dung không được để trống"}, status=status.HTTP_400_BAD_REQUEST)

        topic.title = title
        topic.content = content
        topic.save()
        return Response(ForumTopicSerializer(topic).data)

    def delete(self, request, topic_id):
        topic = ForumTopic.objects.filter(id=topic_id).first()
        if not topic:
            return Response({"error": "Chủ đề không tồn tại"}, status=status.HTTP_404_NOT_FOUND)

        if topic.user_id != request.user.id and request.user.role != 'admin':
            return Response({"error": "Không có quyền xóa chủ đề"}, status=status.HTTP_403_FORBIDDEN)

        topic.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ReplyToTopicView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self,request,topic_id):
        content = (request.data.get('content') or '').strip()
        image_url = (request.data.get('image_url') or '').strip()
        link_url = (request.data.get('link_url') or '').strip()
        image_file = request.FILES.get('image_file')
        if not content and not image_url and not link_url and not image_file:
            return Response({"error": "Vui lòng nhập nội dung hoặc link/ảnh."}, status=status.HTTP_400_BAD_REQUEST)
        response = InteractionService.reply_to_topic(request.user, topic_id, content, image_url, link_url, image_file)
        return Response({"message": "Trả lời đã được đăng"}, status=status.HTTP_201_CREATED)
    
class GetReplyTopicView(APIView):
    def get(self,request,topic_id):
        responses = InteractionService.get_replyTopic(topic_id)
        serializer = ForumResponseSerializer(responses, many=True)
        return Response(serializer.data)

class PendingForumTopicListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Không có quyền truy cập"}, status=status.HTTP_403_FORBIDDEN)
        topics = ForumTopic.objects.filter(is_approved=False).order_by('-created_at')
        return Response(ForumTopicSerializer(topics, many=True).data)

class ApproveForumTopicView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, topic_id):
        if request.user.role != 'admin':
            return Response({"error": "Không có quyền duyệt bài"}, status=status.HTTP_403_FORBIDDEN)
        
        topic = InteractionService.approve_topic(topic_id)
        if not topic:
            return Response({"error": "Không tìm thấy bài viết"}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({"message": "Đã duyệt bài viết thành công"}, status=status.HTTP_200_OK)

    def delete(self, request, topic_id):
        if request.user.role != 'admin':
            return Response({"error": "Không có quyền xóa bài"}, status=status.HTTP_403_FORBIDDEN)
        
        deleted = InteractionService.reject_topic(topic_id)
        if not deleted:
            return Response({"error": "Không tìm thấy bài viết"}, status=status.HTTP_404_NOT_FOUND)
            
        return Response({"message": "Đã từ chối/xóa bài viết"}, status=status.HTTP_200_OK)