from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ('education', '0009_course_content_blocks'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='quiz',
            name='quiz_exactly_one_fk',
        ),
        migrations.AddConstraint(
            model_name='quiz',
            constraint=models.CheckConstraint(
                condition=(
                    (Q(lesson__isnull=False) & Q(chapter__isnull=True) & Q(course__isnull=True)) |
                    (Q(lesson__isnull=True) & Q(chapter__isnull=False) & Q(course__isnull=True)) |
                    (Q(lesson__isnull=True) & Q(chapter__isnull=True) & Q(course__isnull=False)) |
                    (Q(quiz_type='practice') & Q(lesson__isnull=True) & Q(chapter__isnull=True) & Q(course__isnull=True))
                ),
                name='quiz_exactly_one_fk',
            ),
        ),
    ]
