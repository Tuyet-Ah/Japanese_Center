from education.models import LessonComment, LessonNote, ForumTopic, ForumResponse

class InteractionService:
    # --- Thảo luận bài học ---
    @staticmethod
    def add_comment(user, lesson_id, content):
        return LessonComment.objects.create(user=user, lesson_id=lesson_id, content=content)

    @staticmethod
    def get_lesson_comments(lesson_id):
        return LessonComment.objects.filter(lesson_id=lesson_id).order_by('-created_at')

    # --- Ghi chú cá nhân ---
    @staticmethod
    def upsert_note(user, lesson_id, content, timestamp):
        note, created = LessonNote.objects.update_or_create(
            user=user, lesson_id=lesson_id, video_timestamp=timestamp,
            defaults={'content': content}
        )
        return note

    # --- Diễn đàn ---
    @staticmethod
    def create_topic(user, data):
        return ForumTopic.objects.create(
            user=user, 
            title=data.get('title'),
            category=data.get('category'),
            content=data.get('content')
        )

    @staticmethod
    def reply_to_topic(user, topic_id, content):
        return ForumResponse.objects.create(user=user, topic_id=topic_id, content=content)