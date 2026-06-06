from rest_framework import serializers
from education.models import Section
from .QuestionGroupSerializer import QuestionGroupSerializer


class SectionSerializer(serializers.ModelSerializer):
    question_groups = QuestionGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'name', 'max_score', 'order_index', 'question_groups']
