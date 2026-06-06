from rest_framework import serializers
from education.models import QuizSubmissionAnswer


class QuizSubmissionAnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.ReadOnlyField(source='question.id')
    question_text = serializers.ReadOnlyField(source='question.text')
    question_type = serializers.ReadOnlyField(source='question.question_type')
    explain_text = serializers.ReadOnlyField(source='question.explanation')
    correct_answer = serializers.SerializerMethodField()
    correct_texts = serializers.SerializerMethodField()
    opt_a = serializers.ReadOnlyField(source='question.opt_a')
    opt_b = serializers.ReadOnlyField(source='question.opt_b')
    opt_c = serializers.ReadOnlyField(source='question.opt_c')
    opt_d = serializers.ReadOnlyField(source='question.opt_d')
    correct = serializers.ReadOnlyField(source='question.correct')

    class Meta:
        model = QuizSubmissionAnswer
        fields = [
            'question_id',
            'question_text',
            'question_type',
            'opt_a',
            'opt_b',
            'opt_c',
            'opt_d',
            'correct',
            'correct_answer',
            'correct_texts',
            'explain_text',
            'selected_choice',
            'selected_text',
            'is_correct'
        ]

    def get_correct_answer(self, obj):
        question = obj.question
        if question.question_type == 'MULTIPLE_CHOICE':
            correct_option = question.mcq_options.filter(is_correct=True).order_by('order_index', 'id').first()
            if correct_option:
                return {
                    'choice_id': correct_option.id,
                    'content': correct_option.content,
                }
            if question.correct:
                return {'choice_id': question.correct, 'content': question.correct}
        return None

    def get_correct_texts(self, obj):
        question = obj.question
        if question.question_type == 'FILL_IN_BLANK':
            return [
                {
                    'acceptable_text': answer.acceptable_text,
                    'is_case_sensitive': answer.is_case_sensitive,
                }
                for answer in question.fib_answers.all()
            ]
        return []
