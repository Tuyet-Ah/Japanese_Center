from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('education', '0004_coursereview'),
    ]

    operations = [
        migrations.CreateModel(
            name='PaymentTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('course_ids', models.JSONField()),
                ('vnp_txn_ref', models.CharField(max_length=64, unique=True)),
                ('order_info', models.CharField(max_length=255)),
                ('vnp_response_code', models.CharField(blank=True, max_length=8)),
                ('vnp_transaction_status', models.CharField(blank=True, max_length=8)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('failed', 'Failed')], default='pending', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payment_transactions', to='education.user')),
            ],
        ),
    ]
