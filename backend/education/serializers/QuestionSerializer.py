from rest_framework import serializers
from education.models import Question

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer dùng để trả đề bài (Ẩn đáp án đúng)"""
    class Meta:
        model = Question
        fields = ['id', 'text', 'opt_a', 'opt_b', 'opt_c', 'opt_d']
