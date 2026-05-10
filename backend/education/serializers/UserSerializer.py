from rest_framework import serializers
from education.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_admin_pending', 'phone', 'address']