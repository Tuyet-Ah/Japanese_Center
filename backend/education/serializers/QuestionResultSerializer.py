from rest_framework import serializers
from education.models import Question

class QuestionResultSerializer(serializers.ModelSerializer):
    """Trả về đầy đủ thông tin bao gồm đáp án đúng và giải thích sau khi thi"""
    class Meta:
        model = Question
        fields = ['id', 'text', 'opt_a', 'opt_b', 'opt_c', 'opt_d', 'correct', 'explanation']
