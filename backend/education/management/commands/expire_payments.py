from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from education.models import Enrollment, PaymentTransaction


class Command(BaseCommand):
    help = "Mark pending payments as failed after a timeout."

    def add_arguments(self, parser):
        parser.add_argument(
            "--seconds",
            type=int,
            default=60,
            help="Timeout in seconds before pending payments are failed.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        timeout_seconds = options["seconds"]
        cutoff = timezone.now() - timedelta(seconds=timeout_seconds)

        pending_payments = PaymentTransaction.objects.select_for_update().filter(
            status="pending",
            created_at__lt=cutoff,
        )

        expired_count = pending_payments.count()
        if expired_count == 0:
            self.stdout.write("No pending payments to expire.")
            return

        course_ids_by_user = {
            payment.id: (
                payment.user_id,
                list(payment.items.values_list('course_id', flat=True))
            )
            for payment in pending_payments.prefetch_related('items')
        }

        pending_payments.update(status="failed")

        for _, (user_id, course_ids) in course_ids_by_user.items():
            Enrollment.objects.filter(
                user_id=user_id,
                course_id__in=course_ids,
                status="pending",
            ).update(status="rejected")

        self.stdout.write(f"Expired {expired_count} pending payment(s).")
