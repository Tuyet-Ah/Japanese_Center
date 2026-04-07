from rest_framework import serializers
from education.models import Enrollment

class EnrollmentProofSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'payment_proof', 'status']
        read_only_fields = ['status']