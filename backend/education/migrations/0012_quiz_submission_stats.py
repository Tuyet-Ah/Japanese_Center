from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0011_quiz_submission_answers'),
    ]

    operations = [
        migrations.AddField(
            model_name='quizsubmission',
            name='correct_count',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='quizsubmission',
            name='total_questions',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='quizsubmission',
            name='duration_seconds',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
