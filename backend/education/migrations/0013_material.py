from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0012_quiz_submission_stats"),
    ]

    operations = [
        migrations.CreateModel(
            name="Material",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("subtitle", models.CharField(blank=True, max_length=255)),
                ("category", models.CharField(choices=[("vocab", "Bộ từ vựng"), ("listen", "Luyện nghe"), ("write", "Luyện viết")], max_length=20)),
                ("level", models.CharField(blank=True, choices=[("N5", "N5"), ("N4", "N4"), ("N3", "N3"), ("N2", "N2"), ("N1", "N1")], max_length=2)),
                ("duration_minutes", models.PositiveIntegerField(blank=True, null=True)),
                ("cover_image", models.ImageField(blank=True, null=True, upload_to="materials/")),
                ("pdf_file", models.FileField(blank=True, null=True, upload_to="materials/pdfs/")),
                ("video_url", models.URLField(blank=True)),
                ("sections", models.JSONField(blank=True, default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
