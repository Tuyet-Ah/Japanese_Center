from rest_framework import serializers
from .models import User, Course,Lesson,Chapter,CartItem,Enrollment,Question,Quiz,QuizSubmission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'phone', 'address']
# class RegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True)
#     class Meta:
#         model = User
#         fields = ('username', 'password', 'email', 'phone', 'address', 'role')
#     def create(self, validated_data):
#         return User.objects.create_user(**validated_data)

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token
    
class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id','title','video_url','pdf_file','order']
    
class ChapterSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    class Meta:
        model = Chapter
        fields = ['id','title','order','lessons']

class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True) 
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'level', 'price', 'thumbnail', 'chapters']

class CourseShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id','title','level','price','thumbnail']

class CartItemSerializer(serializers.ModelSerializer):
    course_details = CourseShortSerializer(source = 'course',read_only=True)
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), 
        write_only=True
    )
    class Meta:
        model = CartItem
        fields = ['id','course','added_at','course_details']

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    class Meta:
        model = Enrollment
        fields=['id','status','course','course_title','payment_proof','enrollled_at']

# Thêm vào file serializers.py hiện tại

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer dùng để trả đề bài (Ẩn đáp án đúng)"""
    class Meta:
        model = Question
        fields = ['id', 'text', 'opt_a', 'opt_b', 'opt_c', 'opt_d']

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title','questions', 'time_limit']

class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz_name = serializers.ReadOnlyField(source='quiz.title')
    class Meta:
        model = QuizSubmission
        fields = ['id', 'quiz_name', 'score', 'submitted_at']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'address', 'avatar', 'role']
        read_only_fields = ['username', 'role']

class EnrollmentProofSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'payment_proof', 'status']
        read_only_fields = ['status']

class QuestionResultSerializer(serializers.ModelSerializer):
    """Trả về đầy đủ thông tin bao gồm đáp án đúng và giải thích sau khi thi"""
    class Meta:
        model = Question
        fields = ['id', 'text', 'opt_a', 'opt_b', 'opt_c', 'opt_d', 'correct', 'explanation']

class CourseProgressSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    completed_lessons = serializers.IntegerField()
    total_lessons = serializers.IntegerField()
    progress_percentage = serializers.FloatField()