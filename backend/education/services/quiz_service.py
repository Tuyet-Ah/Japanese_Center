from ..models import Quiz, Question, QuizSubmission
from django.utils import timezone

class QuizService:

    @staticmethod
    def get_practice_quizzes(level=None):
        queryset = Quiz.objects.filter(quiz_type='practice')
        if level:
            queryset = queryset.filter(level=level)
        return queryset
    

    @staticmethod
    def get_quiz_details(quiz_id):
        """Lấy đề bài (không kèm đáp án đúng) để gửi cho học viên"""
        return Quiz.objects.prefetch_related('questions').get(id=quiz_id)

    @staticmethod
    def submit_quiz(user, quiz_id, user_answers):
        """
        Logic chấm điểm tự động (Senior Approach)
        user_answers format: [{"question_id": 1, "choice": "A"}, ...]
        """
        quiz = Quiz.objects.prefetch_related('questions').get(id=quiz_id)
        questions = {q.id: q for q in quiz.questions.all()}
        
        correct_count = 0
        total_questions = len(questions)
        detail_results = []

        for answer in user_answers:
            q_id = answer.get('question_id')
            user_choice = answer.get('choice')
            
            if q_id in questions:
                question = questions[q_id]
                is_correct = (question.correct == user_choice)
                if is_correct:
                    correct_count += 1
                
                # Trả về kết quả chi tiết kèm giải thích của giáo viên
                detail_results.append({
                    "question_id": q_id,
                    "is_correct": is_correct,
                    "correct_answer": question.correct,
                    "explanation": question.explanation
                })

        # Tính điểm hệ 10
        score = round((correct_count / total_questions) * 10, 2) if total_questions > 0 else 0

        # Lưu lịch sử làm bài
        submission = QuizSubmission.objects.create(
            user=user,
            quiz=quiz,
            score=score
        )

        return {
            "submission_id": submission.id,
            "score": score,
            "correct_count": correct_count,
            "total": total_questions,
            "details": detail_results
        }

    @staticmethod
    def get_user_history(user,quiz_type=None):
        """Lấy lịch sử làm bài của học viên"""
        queryset = QuizSubmission.objects.filter(user=user).select_related('quiz').order_by('-submitted_at')
        if quiz_type:
            queryset = queryset.filter(quiz__quiz_type = quiz_type)
        return queryset