from education.models import Course,Enrollment,Lesson,UserProgress

class CourseService:
    @staticmethod
    def list_all_courses():
        return Course.objects.all().order_by('-id')

    @staticmethod
    def get_course_detail(course_id):
        """Lấy chi tiết và nạp sẵn dữ liệu lồng nhau để tránh N+1 Query"""
        try:
            return Course.objects.prefetch_related('chapters__lessons').get(id=course_id)
        except Course.DoesNotExist:
            raise ValueError("Khóa học không tồn tại")
        
    @staticmethod
    def get_lesson_detail(user, lesson_id):
        """Lấy chi tiết bài học và kiểm tra quyền truy cập"""
        lesson = Lesson.objects.select_related('chapter__course').get(id=lesson_id)
        course = lesson.chapter.course

        # Kiểm tra xem học viên đã mua khóa học này chưa
        is_paid = Enrollment.objects.filter(
            user=user, 
            course=course, 
            status='paid'
        ).exists()

        if not is_paid and user.role != 'admin':
            raise PermissionError("Bạn cần mua khóa học này để xem nội dung.")

        return lesson
    
    @staticmethod
    def mark_lesson_as_completed(user, lesson_id):
        """Đánh dấu đã học xong bài này"""
        lesson = Lesson.objects.get(id=lesson_id)
        progress = UserProgress.objects.get_or_create(
            user=user, 
            lesson=lesson
        )
        progress.is_completed = True
        progress.save()
        return progress
    
    # tiến độ học tập
    @staticmethod
    def get_course_progress(user, course_id):
        from ..models import Lesson, UserProgress
        total_lessons = Lesson.objects.filter(chapter__course_id=course_id).count()
        completed_count = UserProgress.objects.filter(
            user=user, 
            lesson__chapter__course_id=course_id, 
            is_completed=True
        ).count()
        
        percentage = (completed_count / total_lessons * 100) if total_lessons > 0 else 0
        return {
            "completed_lessons": completed_count,
            "total_lessons": total_lessons,
            "progress_percentage": round(percentage, 2)
        }