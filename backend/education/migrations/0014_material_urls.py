from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0013_material"),
    ]

    operations = [
        migrations.AddField(
            model_name="material",
            name="cover_image_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="material",
            name="pdf_url",
            field=models.URLField(blank=True),
        ),
    ]
