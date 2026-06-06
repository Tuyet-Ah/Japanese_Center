from django.db import models


class Material(models.Model):
    CATEGORY_CHOICES = [
        ("vocab", "Bộ từ vựng"),
        ("listen", "Luyện nghe"),
        ("write", "Luyện viết"),
    ]
    LEVEL_CHOICES = [
        ("N5", "N5"),
        ("N4", "N4"),
        ("N3", "N3"),
        ("N2", "N2"),
        ("N1", "N1"),
    ]

    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    level = models.CharField(max_length=2, choices=LEVEL_CHOICES, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    cover_image = models.ImageField(upload_to="materials/", null=True, blank=True)
    cover_image_url = models.URLField(blank=True)
    pdf_file = models.FileField(upload_to="materials/pdfs/", null=True, blank=True)
    pdf_url = models.URLField(blank=True)
    video_url = models.URLField(blank=True)
    objective = models.TextField(blank=True)
    vocab_examples = models.TextField(blank=True)
    exercise_file = models.FileField(upload_to="materials/exercises/", null=True, blank=True)
    exercise_url = models.URLField(blank=True)
    sections = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
