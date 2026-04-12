from rest_framework import serializers
from education.models import Enrollment

class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    class Meta:
        model = Enrollment
        fields=['id','status','course','course_title','payment_proof','enrollled_at']
