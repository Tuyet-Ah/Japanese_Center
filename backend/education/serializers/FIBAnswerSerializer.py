from rest_framework import serializers
from education.models import FIBAnswer


class FIBAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FIBAnswer
        fields = ['id', 'acceptable_text', 'is_case_sensitive']
