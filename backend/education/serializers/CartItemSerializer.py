from rest_framework import serializers
from education.models import  Course,CartItem
from .CourseShortSerializer import CourseShortSerializer
class CartItemSerializer(serializers.ModelSerializer):
    course_details = CourseShortSerializer(source = 'course',read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), 
        write_only=True
    )
    class Meta:
        model = CartItem
        fields = ['id','course','course_id','added_at','course_details']
