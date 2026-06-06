from rest_framework import serializers
from education.models import MCQOption


class MCQOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQOption
        fields = ['id', 'content', 'order_index']
