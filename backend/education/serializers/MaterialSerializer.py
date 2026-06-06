from rest_framework import serializers
from education.models import Material


class MaterialSerializer(serializers.ModelSerializer):
    category_label = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            "id",
            "title",
            "subtitle",
            "category",
            "category_label",
            "level",
            "duration_minutes",
            "cover_image",
            "cover_image_url",
            "pdf_file",
            "pdf_url",
            "video_url",
            "objective",
            "vocab_examples",
            "exercise_file",
            "exercise_url",
            "sections",
            "created_at",
        ]

    def get_category_label(self, obj):
        return obj.get_category_display()
