from rest_framework import serializers
from education.models import ForumResponse

class ForumResponseSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = ForumResponse
        fields = ['id', 'user_name', 'content', 'created_at']

