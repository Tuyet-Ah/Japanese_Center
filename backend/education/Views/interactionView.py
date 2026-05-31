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
        topics = ForumTopic.objects.all().order_by('-created_at')
        return Response(ForumTopicSerializer(topics, many=True).data)

    def post(self, request):
        topic = InteractionService.create_topic(request.user, request.data)
        return Response(ForumTopicSerializer(topic).data, status=status.HTTP_201_CREATED)

class ReplyToTopicView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self,request,topic_id):
        content = request.data.get('content')
        response = InteractionService.reply_to_topic(request.user, topic_id, content)
        return Response({"message": "Trả lời đã được đăng"}, status=status.HTTP_201_CREATED)
    
class GetReplyTopicView(APIView):
    def get(self,request,topic_id):
        responses = InteractionService.get_replyTopic(topic_id)
        serializer = ForumResponseSerializer(responses, many=True)
        return Response(serializer.data)