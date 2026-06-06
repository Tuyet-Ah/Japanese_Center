from rest_framework import serializers
from education.models import ForumResponse

class ForumResponseSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(source='user.avatar', read_only=True)
    class Meta:
        model = ForumResponse
        fields = ['id', 'user_name', 'avatar', 'content', 'image_file', 'image_url', 'link_url', 'created_at']

