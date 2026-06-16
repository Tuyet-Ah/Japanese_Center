from rest_framework import serializers
from education.models import ForumTopic


class ForumTopicSerializer(serializers.ModelSerializer):
    user_name   = serializers.ReadOnlyField(source='user.username')
    user_avatar = serializers.SerializerMethodField()
    response_count = serializers.IntegerField(source='responses.count', read_only=True)

    class Meta:
        model = ForumTopic
        fields = [
            'id', 'user_name', 'user_avatar',
            'title', 'category', 'content',
            'response_count', 'created_at',
        ]

    def get_user_avatar(self, obj):
        """Trả về URL avatar của user, None nếu chưa có."""
        request = self.context.get('request')
        avatar  = getattr(obj.user, 'avatar', None)
        if not avatar:
            return None
        if request:
            return request.build_absolute_uri(avatar.url)
        return avatar.url
