from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0015_lesson_description"),
    ]

    operations = [
        migrations.AddField(
            model_name="forumresponse",
            name="image_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="forumresponse",
            name="link_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="forumresponse",
            name="content",
            field=models.TextField(blank=True, default=""),
        ),
    ]
