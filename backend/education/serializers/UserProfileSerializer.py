from rest_framework import serializers
from education.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        full_name = obj.get_full_name().strip()
        return full_name or obj.username

    def get_avatar_url(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        if not obj.avatar:
            return None
        url = obj.avatar.url
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'phone', 'address', 'avatar_url', 'role']
        read_only_fields = ['username', 'role', 'avatar_url']
