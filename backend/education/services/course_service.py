from education.models import Course,Enrollment,Lesson,UserProgress,CourseReview
from django.db.models import Q,Avg
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
        progress, _ = UserProgress.objects.get_or_create(
            user=user, 
            lesson=lesson
        )
        progress.is_completed = True
        progress.save()
        return progress
    
    # tiến độ học tập
    @staticmethod
    def get_course_progress(user, course_id):
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
    @staticmethod
    def filter_courses(query_params):
        """Logic lọc khóa học nâng cao"""
        queryset = Course.objects.all()

        # 1. Lọc theo từ khóa (Tiêu đề hoặc mô tả)
        search = query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        # 2. Lọc theo trình độ JLPT (N5, N4,...)
        level = query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)

        # 3. Lọc theo khoảng giá
        min_price = query_params.get('min_price')
        max_price = query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # 4. Sắp xếp (Mới nhất, Giá tăng/giảm)
        ordering = query_params.get('ordering', '-created_at')
        return queryset.order_by(ordering)

    @staticmethod
    def get_course_rating(course_id):
        """Tính điểm trung bình của khóa học"""
        return CourseReview.objects.filter(course_id=course_id).aggregate(Avg('rating'))['rating__avg'] or 0
    #Gợi ý tìm kiếm
    @staticmethod
    def suggest_courses(query):
        """Gợi ý nhanh tên khóa học khi người dùng đang nhập"""
        if not query:
            return []
        # Chỉ lấy ID và Title để tối ưu tốc độ (không lấy cả object nặng)
        return Course.objects.filter(title__icontains=query).values('id', 'title')[:5]
    
    @staticmethod
    def add_review(user, course_id, rating, comment):
        # 1. Kiểm tra xem học viên đã thanh toán khóa học này chưa
        has_paid = Enrollment.objects.filter(
            user=user, 
            course_id=course_id, 
            status='paid'
        ).exists()
        
        if not has_paid:
            raise PermissionError("Bạn cần mua khóa học trước khi để lại đánh giá.")

        # 2. Tạo hoặc cập nhật đánh giá
        review, created = CourseReview.objects.update_or_create(
            user=user, 
            course_id=course_id,
            defaults={'rating': rating, 'comment': comment}
        )
        return review

    @staticmethod
    def get_course_reviews(course_id,rating=None):
        """Lấy danh sách đánh giá của một khóa học và có lọc theo sao"""
        queryset = CourseReview.objects.filter(course_id=course_id)
        if rating:
            queryset = queryset.filter(rating=rating)
        return queryset.order_by('-created_at')