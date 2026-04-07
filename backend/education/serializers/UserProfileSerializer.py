from rest_framework import serializers
from education.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'address', 'avatar', 'role']
        read_only_fields = ['username', 'role']
