from rest_framework import serializers
from education.models import LessonComment

class LessonCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    class Meta:
        model = LessonComment
        fields = ['id', 'user_name', 'avatar', 'content', 'created_at']