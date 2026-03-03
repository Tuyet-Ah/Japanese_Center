from django.contrib import admin
from .models import User, Course, Lesson, JapaneseClass, Enrollment, Attendance

# Đăng ký các Model để chúng hiển thị trong trang Admin
admin.site.register(User)
admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(JapaneseClass)
admin.site.register(Enrollment)
admin.site.register(Attendance)