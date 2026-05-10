from rest_framework import serializers
from education.models import Chapter


class ChapterCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['title', 'order']
