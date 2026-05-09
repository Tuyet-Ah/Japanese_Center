from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('education', '0006_optimize_relations'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_admin_pending',
            field=models.BooleanField(default=False),
        ),
    ]
