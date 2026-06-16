from rest_framework import serializers
from education.models import ForumResponse


class ForumResponseSerializer(serializers.ModelSerializer):
    user_name   = serializers.ReadOnlyField(source='user.username')
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = ForumResponse
        fields = [
            'id', 'user_name', 'user_avatar',
            'content', 'image_file', 'image_url', 'link_url', 'created_at',
        ]

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        avatar  = getattr(obj.user, 'avatar', None)
        if not avatar:
            return None
        if request:
            return request.build_absolute_uri(avatar.url)
        return avatar.url
