from rest_framework import serializers
from education.models import ForumTopic
class ForumTopicSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    response_count = serializers.IntegerField(source='responses.count', read_only=True)
    class Meta:
        model = ForumTopic
        fields = ['id', 'user_name', 'avatar', 'title', 'category', 'content', 'views', 'response_count', 'created_at']