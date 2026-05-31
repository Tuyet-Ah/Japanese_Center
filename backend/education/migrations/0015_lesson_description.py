from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0014_material_urls"),
    ]

    operations = [
        migrations.AddField(
            model_name="lesson",
            name="description",
            field=models.TextField(blank=True, default=""),
        ),
    ]
