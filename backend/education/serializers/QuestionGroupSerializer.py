from rest_framework import serializers
from education.models import QuestionGroup
from .QuestionSerializer import QuestionSerializer


class QuestionGroupSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionGroup
        fields = ['id', 'instruction', 'passage_text', 'audio_url', 'group_type', 'order_index', 'questions']
