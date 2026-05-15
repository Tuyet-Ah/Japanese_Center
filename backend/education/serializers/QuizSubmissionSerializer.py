from rest_framework import serializers
from education.models import QuizSubmission


class QuizSubmissionSerializer(serializers.ModelSerializer):
    quiz_id = serializers.ReadOnlyField(source='quiz.id')
    quiz_name = serializers.ReadOnlyField(source='quiz.title')
    class Meta:
        model = QuizSubmission
        fields = ['id', 'quiz_id', 'quiz_name', 'score', 'correct_count', 'total_questions', 'duration_seconds', 'submitted_at']
