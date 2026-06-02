from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("education", "0016_forumresponse_media"),
    ]

    operations = [
        migrations.AddField(
            model_name="forumresponse",
            name="image_file",
            field=models.ImageField(blank=True, null=True, upload_to="forum_responses/images/"),
        ),
    ]
