from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0010_allow_practice_quiz_without_fk'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuizSubmissionAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('selected_choice', models.CharField(max_length=1)),
                ('is_correct', models.BooleanField(default=False)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='submission_answers', to='education.question')),
                ('submission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='education.quizsubmission')),
            ],
            options={
                'unique_together': {('submission', 'question')},
                'indexes': [models.Index(fields=['submission'], name='idx_submission_answer')],
            },
        ),
    ]
