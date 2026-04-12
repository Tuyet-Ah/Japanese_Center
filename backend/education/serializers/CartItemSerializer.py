from rest_framework import serializers
from education.models import  Course,CartItem
from .CourseShortSerializer import CourseShortSerializer
class CartItemSerializer(serializers.ModelSerializer):
    course_details = CourseShortSerializer(source = 'course',read_only=True)
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), 
        write_only=True
    )
    class Meta:
        model = CartItem
        fields = ['id','course','added_at','course_details']
