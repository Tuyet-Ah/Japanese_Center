from django.contrib import admin
from education.models import User, Course, CourseReview, Chapter, Lesson, Enrollment, CartItem, Question, Quiz, QuizSubmission, UserProgress, LessonComment, LessonNote, ForumResponse, ForumTopic, PaymentTransaction, PaymentTransactionItem, Material

# Cho phép tạo Lesson ngay trong trang Chapter
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

class ChapterAdmin(admin.ModelAdmin):
    inlines = [LessonInline]

# Đăng ký các bảng vào trang Admin
admin.site.register(User)
admin.site.register(Course)
admin.site.register(CourseReview)
admin.site.register(Chapter, ChapterAdmin)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(CartItem)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(QuizSubmission)
admin.site.register(UserProgress)
admin.site.register(LessonNote)
admin.site.register(LessonComment)
admin.site.register(ForumResponse)
@admin.action(description="Duyệt bài viết đã chọn")
def approve_topics(modeladmin, request, queryset):
    queryset.update(is_approved=True)

class ForumTopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'category')
    actions = [approve_topics]

admin.site.register(ForumTopic, ForumTopicAdmin)
admin.site.register(PaymentTransaction)
admin.site.register(PaymentTransactionItem)
admin.site.register(Material)