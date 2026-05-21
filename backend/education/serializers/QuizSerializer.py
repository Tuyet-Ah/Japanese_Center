from rest_framework import serializers
from education.models import Quiz, QuizSubmission
from .QuestionSerializer import QuestionSerializer


class QuizListSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()
    attempt_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'level', 'quiz_type', 'time_limit', 'question_count', 'attempt_count']

    def get_question_count(self, obj):
        return obj.questions.count()

    def get_attempt_count(self, obj):
        return QuizSubmission.objects.filter(quiz=obj).count()


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'level', 'quiz_type', 'time_limit', 'questions', 'question_count']

    def get_question_count(self, obj):
        return obj.questions.count()
