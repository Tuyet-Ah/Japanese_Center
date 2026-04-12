from rest_framework import serializers
from education.models import User, Course,Lesson,Chapter,CartItem,Enrollment,Question,Quiz,QuizSubmission
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token