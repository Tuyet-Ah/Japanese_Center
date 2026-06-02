from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from education.models import User, Course, Enrollment, PaymentTransaction, PaymentTransactionItem


class AdminStatisticsView(APIView):
    """
    Admin statistics API: returns enrollment, revenue, and user data
    filtered by date range (query params: from_date, to_date).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin' or request.user.is_admin_pending:
            return Response({"error": "Không có quyền xem thống kê"}, status=403)

        # Parse date filters
        from_date_str = request.query_params.get('from_date')
        to_date_str = request.query_params.get('to_date')

        now = timezone.now()
        # Default: last 12 months
        if from_date_str:
            try:
                from_date = timezone.datetime.strptime(from_date_str, '%Y-%m-%d')
                from_date = timezone.make_aware(from_date) if timezone.is_naive(from_date) else from_date
            except ValueError:
                from_date = now - timedelta(days=365)
        else:
            from_date = now - timedelta(days=365)

        if to_date_str:
            try:
                to_date = timezone.datetime.strptime(to_date_str, '%Y-%m-%d')
                to_date = timezone.make_aware(to_date.replace(hour=23, minute=59, second=59)) if timezone.is_naive(to_date) else to_date
            except ValueError:
                to_date = now
        else:
            to_date = now

        # ==================== OVERVIEW STATS ====================
        total_students = User.objects.filter(role='student').count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.filter(status='paid').count()

        # Total revenue from successful payments
        total_revenue = PaymentTransaction.objects.filter(
            status='success'
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Revenue in date range
        revenue_in_range = PaymentTransaction.objects.filter(
            status='success',
            paid_at__gte=from_date,
            paid_at__lte=to_date
        ).aggregate(total=Sum('amount'))['total'] or 0

        # ==================== ENROLLMENTS BY MONTH ====================
        enrollments_by_month = (
            Enrollment.objects.filter(
                status='paid',
                enrolled_at__gte=from_date,
                enrolled_at__lte=to_date
            )
            .annotate(month=TruncMonth('enrolled_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        enrollment_chart = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'count': item['count']
            }
            for item in enrollments_by_month
        ]

        # ==================== REVENUE BY MONTH ====================
        revenue_by_month = (
            PaymentTransaction.objects.filter(
                status='success',
                paid_at__gte=from_date,
                paid_at__lte=to_date
            )
            .annotate(month=TruncMonth('paid_at'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        revenue_chart = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'total': float(item['total'])
            }
            for item in revenue_by_month
        ]

        # ==================== REVENUE PER COURSE ====================
        revenue_per_course = (
            PaymentTransactionItem.objects.filter(
                payment__status='success',
                payment__paid_at__gte=from_date,
                payment__paid_at__lte=to_date
            )
            .values('course__id', 'course__title', 'course__level')
            .annotate(
                total_revenue=Sum('amount'),
                enrollment_count=Count('id')
            )
            .order_by('-total_revenue')
        )
        course_revenue = [
            {
                'course_id': item['course__id'],
                'title': item['course__title'],
                'level': item['course__level'],
                'total_revenue': float(item['total_revenue']),
                'enrollment_count': item['enrollment_count']
            }
            for item in revenue_per_course
        ]

        # ==================== NEW STUDENTS BY MONTH ====================
        new_students_by_month = (
            User.objects.filter(
                role='student',
                date_joined__gte=from_date,
                date_joined__lte=to_date
            )
            .annotate(month=TruncMonth('date_joined'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        students_chart = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'count': item['count']
            }
            for item in new_students_by_month
        ]

        # ==================== ENROLLMENTS BY LEVEL ====================
        enrollments_by_level = (
            Enrollment.objects.filter(
                status='paid',
                enrolled_at__gte=from_date,
                enrolled_at__lte=to_date
            )
            .values('course__level')
            .annotate(count=Count('id'))
            .order_by('course__level')
        )
        level_chart = [
            {
                'level': item['course__level'],
                'count': item['count']
            }
            for item in enrollments_by_level
        ]

        return Response({
            'overview': {
                'total_students': total_students,
                'total_courses': total_courses,
                'total_enrollments': total_enrollments,
                'total_revenue': float(total_revenue),
                'revenue_in_range': float(revenue_in_range),
            },
            'enrollment_chart': enrollment_chart,
            'revenue_chart': revenue_chart,
            'course_revenue': course_revenue,
            'students_chart': students_chart,
            'level_chart': level_chart,
            'date_range': {
                'from_date': from_date.strftime('%Y-%m-%d'),
                'to_date': to_date.strftime('%Y-%m-%d'),
            }
        })
