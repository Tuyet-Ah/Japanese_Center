from rest_framework import serializers
from education.models import Quiz
from .QuestionSerializer import QuestionSerializer

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'title','questions', 'time_limit']
