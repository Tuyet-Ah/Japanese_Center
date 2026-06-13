"""
ExamSerializer — Hệ thống serializer phân cấp cho Exam CRUD.

Cấu trúc:
  ExamSerializer (đọc đầy đủ với Left Join MCQ + FIB)
  ExamListSerializer (danh sách nhẹ, có phân trang)
  ExamWriteSerializer (tạo/sửa nguyên khối — Deep Insert)
"""

from rest_framework import serializers
from education.models import (
    Exam, ExamSection, QuestionGroup, ExamQuestion, McqOption, FibAnswer,
)


# ─────────────────────────────────────────────
# READ serializers (trả về đề bài đầy đủ)
# ─────────────────────────────────────────────

class McqOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = McqOption
        fields = ['id', 'content', 'is_correct', 'order_index']


class FibAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FibAnswer
        fields = ['id', 'acceptable_text', 'is_case_sensitive']


class ExamQuestionReadSerializer(serializers.ModelSerializer):
    """
    Thực hiện Left Join song song cả mcq_options và fib_answers.
    Dù question_type là gì, luôn trả cả 2 danh sách (list rỗng nếu không có).
    """
    mcq_options = McqOptionSerializer(many=True, read_only=True)
    fib_answers = FibAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = ExamQuestion
        fields = [
            'id', 'question_number', 'content', 'question_type',
            'points', 'explain_text', 'mcq_options', 'fib_answers',
        ]


class QuestionGroupReadSerializer(serializers.ModelSerializer):
    questions = ExamQuestionReadSerializer(many=True, read_only=True)

    class Meta:
        model = QuestionGroup
        fields = [
            'id', 'instruction', 'passage_text', 'audio_url',
            'group_type', 'order_index', 'questions',
        ]


class ExamSectionReadSerializer(serializers.ModelSerializer):
    question_groups = QuestionGroupReadSerializer(many=True, read_only=True)

    class Meta:
        model = ExamSection
        fields = ['id', 'name', 'max_score', 'order_index', 'question_groups']


class ExamSerializer(serializers.ModelSerializer):
    """Serializer đọc đầy đủ — dùng cho GET /exams/<pk>/"""
    sections = ExamSectionReadSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = [
            'id', 'title', 'level', 'duration', 'total_score',
            'status', 'created_at', 'updated_at', 'question_count', 'sections',
        ]

    def get_question_count(self, obj):
        return ExamQuestion.objects.filter(group__section__exam=obj).count()


class ExamListSerializer(serializers.ModelSerializer):
    """Serializer nhẹ cho danh sách — dùng cho GET /exams/"""
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'title', 'level', 'duration', 'total_score', 'status', 'created_at', 'question_count']

    def get_question_count(self, obj):
        return ExamQuestion.objects.filter(group__section__exam=obj).count()


# ─────────────────────────────────────────────
# WRITE serializers (tạo/cập nhật — Deep Insert)
# ─────────────────────────────────────────────

class McqOptionWriteSerializer(serializers.Serializer):
    id          = serializers.IntegerField(required=False, allow_null=True)
    content     = serializers.CharField()
    is_correct  = serializers.BooleanField(default=False)
    order_index = serializers.IntegerField(default=0)


class FibAnswerWriteSerializer(serializers.Serializer):
    id                = serializers.IntegerField(required=False, allow_null=True)
    acceptable_text   = serializers.CharField()
    is_case_sensitive = serializers.BooleanField(default=False)


class ExamQuestionWriteSerializer(serializers.Serializer):
    id              = serializers.IntegerField(required=False, allow_null=True)
    question_number = serializers.IntegerField(default=1)
    content         = serializers.CharField()
    question_type   = serializers.ChoiceField(choices=['MULTIPLE_CHOICE', 'FILL_IN_BLANK'])
    points          = serializers.IntegerField(default=1)
    explain_text    = serializers.CharField(required=False, allow_blank=True, default='')
    mcq_options     = McqOptionWriteSerializer(many=True, required=False, default=list)
    fib_answers     = FibAnswerWriteSerializer(many=True, required=False, default=list)

    def validate(self, data):
        qtype = data.get('question_type')
        if qtype == 'MULTIPLE_CHOICE' and not data.get('mcq_options'):
            raise serializers.ValidationError('Câu trắc nghiệm phải có ít nhất 1 lựa chọn.')
        if qtype == 'FILL_IN_BLANK' and not data.get('fib_answers'):
            raise serializers.ValidationError('Câu điền từ phải có ít nhất 1 đáp án hợp lệ.')
        return data


class QuestionGroupWriteSerializer(serializers.Serializer):
    id           = serializers.IntegerField(required=False, allow_null=True)
    instruction  = serializers.CharField(required=False, allow_blank=True, default='')
    passage_text = serializers.CharField(required=False, allow_blank=True, default='')
    audio_url    = serializers.URLField(required=False, allow_null=True, allow_blank=True, default=None)
    group_type   = serializers.ChoiceField(choices=['text', 'audio', 'none'], default='none')
    order_index  = serializers.IntegerField(default=0)
    questions    = ExamQuestionWriteSerializer(many=True, required=False, default=list)


class ExamSectionWriteSerializer(serializers.Serializer):
    id          = serializers.IntegerField(required=False, allow_null=True)
    name        = serializers.CharField()
    max_score   = serializers.IntegerField(default=0)
    order_index = serializers.IntegerField(default=0)
    question_groups = QuestionGroupWriteSerializer(many=True, required=False, default=list)


class ExamWriteSerializer(serializers.Serializer):
    """
    Deep Insert / Update serializer cho toàn bộ cây Exam.
    POST   /admin/exams/        → tạo mới hoàn toàn
    PATCH  /admin/exams/<pk>/   → cập nhật (upsert sections/groups/questions,
                                  xoá những id không còn trong payload)
    """
    title       = serializers.CharField()
    level       = serializers.ChoiceField(choices=['N5', 'N4', 'N3', 'N2', 'N1'])
    duration    = serializers.IntegerField(min_value=1)
    total_score = serializers.IntegerField(min_value=1, default=100)
    status      = serializers.ChoiceField(choices=['draft', 'published', 'hidden'], default='draft')
    sections    = ExamSectionWriteSerializer(many=True, required=False, default=list)
