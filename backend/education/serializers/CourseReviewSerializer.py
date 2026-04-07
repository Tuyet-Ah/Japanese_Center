from rest_framework import serializers
from education.models import CourseReview

class CourseReviewSerializer(serializers.ModelSerializer):
    # Lấy tên hiển thị và ảnh đại diện của người đánh giá để Frontend render
    user_name = serializers.ReadOnlyField(source='user.username')
    avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'user_name', 'avatar', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

    def validate_rating(self, value):
        """Kiểm tra điểm đánh giá phải từ 1 đến 5 sao"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Đánh giá chỉ được từ 1 đến 5 sao.")
        return value