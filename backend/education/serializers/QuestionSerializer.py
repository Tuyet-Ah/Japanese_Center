from rest_framework import serializers
from education.models import Question
from .MCQOptionSerializer import MCQOptionSerializer
from .FIBAnswerSerializer import FIBAnswerSerializer

class QuestionSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='text')
    explain_text = serializers.CharField(source='explanation', allow_blank=True, required=False)
    options = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            'id',
            'question_number',
            'content',
            'question_type',
            'points',
            'group',
            'options',
            'answers',
            'explain_text',
            'opt_a',
            'opt_b',
            'opt_c',
            'opt_d',
        ]

    def get_options(self, obj):
        if obj.question_type == 'MULTIPLE_CHOICE':
            if obj.mcq_options.exists():
                return MCQOptionSerializer(obj.mcq_options.all(), many=True).data
            legacy_options = []
            legacy_values = [obj.opt_a, obj.opt_b, obj.opt_c, obj.opt_d]
            for index, value in enumerate(legacy_values):
                if value:
                    legacy_options.append({
                        'id': f'legacy-{index + 1}',
                        'content': value,
                        'order_index': index + 1,
                    })
            return legacy_options
        return []

    def get_answers(self, obj):
        if obj.question_type == 'FILL_IN_BLANK':
            if obj.fib_answers.exists():
                return FIBAnswerSerializer(obj.fib_answers.all(), many=True).data
            return []
        return []

