from rest_framework import serializers
from education.models import ForumTopic
class ForumTopicSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    response_count = serializers.IntegerField(source='responses.count', read_only=True)
    class Meta:
        model = ForumTopic
        fields = ['id', 'user_name', 'title', 'category', 'content', 'response_count', 'created_at']