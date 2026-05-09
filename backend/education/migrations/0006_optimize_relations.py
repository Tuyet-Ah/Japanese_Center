from django.db import migrations, models
import django.db.models.deletion
from django.db.models import Q


def drop_paymenttransaction_course_ids_if_exists(apps, schema_editor):
    table_name = 'education_paymenttransaction'
    with schema_editor.connection.cursor() as cursor:
        columns = [col.name for col in schema_editor.connection.introspection.get_table_description(cursor, table_name)]
    if 'course_ids' in columns:
        schema_editor.execute(f'ALTER TABLE {table_name} DROP COLUMN course_ids;')



def _index_exists(cursor, table_name, index_name):
    cursor.execute(
        """
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
          AND INDEX_NAME = %s
        LIMIT 1
        """,
        [table_name, index_name],
    )
    return cursor.fetchone() is not None


def _constraint_exists(cursor, table_name, constraint_name):
    cursor.execute(
        """
        SELECT 1
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
          AND CONSTRAINT_NAME = %s
        LIMIT 1
        """,
        [table_name, constraint_name],
    )
    return cursor.fetchone() is not None


def add_unique_enrollment_user_course_if_missing(apps, schema_editor):
    table_name = 'education_enrollment'
    index_name = 'uniq_enrollment_user_course'
    with schema_editor.connection.cursor() as cursor:
        if _index_exists(cursor, table_name, index_name):
            return
    schema_editor.execute(
        f'CREATE UNIQUE INDEX {index_name} ON {table_name} (user_id, course_id);'
    )


def add_index_enrollment_user_status_if_missing(apps, schema_editor):
    table_name = 'education_enrollment'
    index_name = 'idx_enrollment_user_status'
    with schema_editor.connection.cursor() as cursor:
        if _index_exists(cursor, table_name, index_name):
            return
    schema_editor.execute(
        f'CREATE INDEX {index_name} ON {table_name} (user_id, status);'
    )


def add_unique_cart_user_course_if_missing(apps, schema_editor):
    table_name = 'education_cartitem'
    index_name = 'uniq_cart_user_course'
    with schema_editor.connection.cursor() as cursor:
        if _index_exists(cursor, table_name, index_name):
            return
    schema_editor.execute(
        f'CREATE UNIQUE INDEX {index_name} ON {table_name} (user_id, course_id);'
    )


def add_index_progress_user_lesson_if_missing(apps, schema_editor):
    table_name = 'education_userprogress'
    index_name = 'idx_progress_user_lesson'
    with schema_editor.connection.cursor() as cursor:
        if _index_exists(cursor, table_name, index_name):
            return
    schema_editor.execute(
        f'CREATE INDEX {index_name} ON {table_name} (user_id, lesson_id);'
    )


def add_index_submission_user_quiz_if_missing(apps, schema_editor):
    table_name = 'education_quizsubmission'
    index_name = 'idx_submission_user_quiz'
    with schema_editor.connection.cursor() as cursor:
        if _index_exists(cursor, table_name, index_name):
            return
    schema_editor.execute(
        f'CREATE INDEX {index_name} ON {table_name} (user_id, quiz_id);'
    )


def add_quiz_exactly_one_fk_constraint_if_missing(apps, schema_editor):
    table_name = 'education_quiz'
    constraint_name = 'quiz_exactly_one_fk'
    with schema_editor.connection.cursor() as cursor:
        if _constraint_exists(cursor, table_name, constraint_name):
            return
    schema_editor.execute(
        f'ALTER TABLE {table_name} '
        'ADD CONSTRAINT quiz_exactly_one_fk CHECK ('
        '(lesson_id IS NOT NULL AND chapter_id IS NULL AND course_id IS NULL) OR '
        '(lesson_id IS NULL AND chapter_id IS NOT NULL AND course_id IS NULL) OR '
        '(lesson_id IS NULL AND chapter_id IS NULL AND course_id IS NOT NULL)'
        ');'
    )


class Migration(migrations.Migration):
    dependencies = [
        ('education', '0005_paymenttransaction'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    drop_paymenttransaction_course_ids_if_exists,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.RemoveField(
                    model_name='paymenttransaction',
                    name='course_ids',
                )
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "CREATE TABLE IF NOT EXISTS education_paymenttransactionitem ("
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY,"
                        "amount DECIMAL(12,2) NOT NULL,"
                        "course_id BIGINT NOT NULL,"
                        "payment_id BIGINT NOT NULL,"
                        "CONSTRAINT education_paymenttransactionitem_course_id_fk "
                        "FOREIGN KEY (course_id) REFERENCES education_course (id) ON DELETE CASCADE,"
                        "CONSTRAINT education_paymenttransactionitem_payment_id_fk "
                        "FOREIGN KEY (payment_id) REFERENCES education_paymenttransaction (id) ON DELETE CASCADE"
                        ")"
                    ),
                    reverse_sql=migrations.RunSQL.noop,
                ),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='PaymentTransactionItem',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                        ('course', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='education.course')),
                        ('payment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='education.paymenttransaction')),
                    ],
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_unique_enrollment_user_course_if_missing,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddConstraint(
                    model_name='enrollment',
                    constraint=models.UniqueConstraint(fields=('user', 'course'), name='uniq_enrollment_user_course'),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_index_enrollment_user_status_if_missing,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddIndex(
                    model_name='enrollment',
                    index=models.Index(fields=['user', 'status'], name='idx_enrollment_user_status'),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_unique_cart_user_course_if_missing,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddConstraint(
                    model_name='cartitem',
                    constraint=models.UniqueConstraint(fields=('user', 'course'), name='uniq_cart_user_course'),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_index_progress_user_lesson_if_missing,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddIndex(
                    model_name='userprogress',
                    index=models.Index(fields=['user', 'lesson'], name='idx_progress_user_lesson'),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_index_submission_user_quiz_if_missing,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddIndex(
                    model_name='quizsubmission',
                    index=models.Index(fields=['user', 'quiz'], name='idx_submission_user_quiz'),
                ),
            ],
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    add_quiz_exactly_one_fk_constraint_if_missing,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.AddConstraint(
                    model_name='quiz',
                    constraint=models.CheckConstraint(
                        condition=(
                            (Q(lesson__isnull=False) & Q(chapter__isnull=True) & Q(course__isnull=True)) |
                            (Q(lesson__isnull=True) & Q(chapter__isnull=False) & Q(course__isnull=True)) |
                            (Q(lesson__isnull=True) & Q(chapter__isnull=True) & Q(course__isnull=False))
                        ),
                        name='quiz_exactly_one_fk',
                    ),
                ),
            ],
        ),
    ]
