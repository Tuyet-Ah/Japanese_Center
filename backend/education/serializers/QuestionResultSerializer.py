from rest_framework import serializers
from education.models import Question
from .QuestionSerializer import QuestionSerializer

class QuestionResultSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='text')
    explain_text = serializers.CharField(source='explanation', allow_blank=True, required=False)
    options = serializers.SerializerMethodField()
    answers = serializers.SerializerMethodField()
    correct_answer = serializers.SerializerMethodField()

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
            'correct_answer',
            'explain_text',
        ]

    def get_options(self, obj):
        return QuestionSerializer(obj, context=self.context).data.get('options', [])

    def get_answers(self, obj):
        return QuestionSerializer(obj, context=self.context).data.get('answers', [])

    def get_correct_answer(self, obj):
        if obj.question_type == 'MULTIPLE_CHOICE':
            if obj.mcq_options.exists():
                correct_option = obj.mcq_options.filter(is_correct=True).order_by('order_index', 'id').first()
                if correct_option:
                    return {
                        'choice_id': correct_option.id,
                        'content': correct_option.content,
                    }
            if obj.correct:
                return {'choice_id': obj.correct, 'content': obj.correct}
        if obj.question_type == 'FILL_IN_BLANK':
            return [
                {
                    'acceptable_text': answer.acceptable_text,
                    'is_case_sensitive': answer.is_case_sensitive,
                }
                for answer in obj.fib_answers.all()
            ]
        return None

