from rest_framework import serializers
from education.models import User, Course, Lesson, Chapter, CartItem, Enrollment, Question, Quiz, QuizSubmission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        if user.role == 'admin' and user.is_admin_pending:
            raise serializers.ValidationError({"detail": "Tài khoản admin đang chờ duyệt"})
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token