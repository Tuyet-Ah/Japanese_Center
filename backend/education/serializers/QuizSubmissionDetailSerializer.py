from rest_framework import serializers
from education.models import QuizSubmissionAnswer


class QuizSubmissionAnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.ReadOnlyField(source='question.id')
    question_text = serializers.ReadOnlyField(source='question.text')
    opt_a = serializers.ReadOnlyField(source='question.opt_a')
    opt_b = serializers.ReadOnlyField(source='question.opt_b')
    opt_c = serializers.ReadOnlyField(source='question.opt_c')
    opt_d = serializers.ReadOnlyField(source='question.opt_d')
    correct = serializers.ReadOnlyField(source='question.correct')
    explanation = serializers.ReadOnlyField(source='question.explanation')

    class Meta:
        model = QuizSubmissionAnswer
        fields = [
            'question_id',
            'question_text',
            'opt_a',
            'opt_b',
            'opt_c',
            'opt_d',
            'correct',
            'explanation',
            'selected_choice',
            'is_correct'
        ]
