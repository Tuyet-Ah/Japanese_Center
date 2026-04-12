from rest_framework import serializers
from education.models import Course

class CourseShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id','title','level','price','thumbnail']