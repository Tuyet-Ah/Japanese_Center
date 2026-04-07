from rest_framework import serializers
from education.models import QuizSubmission


class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz_name = serializers.ReadOnlyField(source='quiz.title')
    class Meta:
        model = QuizSubmission
        fields = ['id', 'quiz_name', 'score', 'submitted_at']
