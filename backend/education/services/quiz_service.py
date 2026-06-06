from education.models import Quiz, QuizSubmission, QuizSubmissionAnswer


def _normalize_text(value):
    return " ".join(str(value or "").strip().split())


def _normalize_for_compare(value, case_sensitive=False):
    normalized = _normalize_text(value)
    return normalized if case_sensitive else normalized.casefold()


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
        return Quiz.objects.prefetch_related(
            'questions__mcq_options',
            'questions__fib_answers',
            'sections__question_groups__questions__mcq_options',
            'sections__question_groups__questions__fib_answers',
        ).get(id=quiz_id)

    @staticmethod
    def submit_quiz(user, quiz_id, user_answers, duration_seconds=0):
        """
        Logic chấm điểm tự động (Senior Approach)
        user_answers format: [{"question_id": 1, "choice": "123"}, {"question_id": 2, "text": "いきます"}, ...]
        """
        quiz = Quiz.objects.prefetch_related('questions__mcq_options', 'questions__fib_answers').get(id=quiz_id)
        questions = {q.id: q for q in quiz.questions.all()}
        
        correct_count = 0
        total_questions = len(questions)
        total_points = sum(float(question.points or 1) for question in questions.values()) or float(total_questions or 1)
        earned_points = 0.0
        detail_results = []

        for answer in user_answers:
            q_id = answer.get('question_id')
            user_choice = answer.get('choice') or answer.get('choice_id') or answer.get('selected_choice')
            user_text = answer.get('text') or answer.get('answer') or answer.get('selected_text') or ''
            
            if q_id in questions:
                question = questions[q_id]
                is_correct = False
                correct_choice = None
                correct_texts = []

                if question.question_type == 'MULTIPLE_CHOICE':
                    mcq_options = list(question.mcq_options.all())
                    if mcq_options:
                        correct_option = next((option for option in mcq_options if option.is_correct), None)
                        if correct_option:
                            correct_choice = str(correct_option.id)
                            selected_choice = str(user_choice or '')
                            is_correct = selected_choice == correct_choice
                        else:
                            correct_choice = question.correct or ''
                            selected_choice = str(user_choice or '')
                            is_correct = selected_choice == correct_choice
                    else:
                        correct_choice = question.correct or ''
                        selected_choice = str(user_choice or '')
                        is_correct = selected_choice == correct_choice
                else:
                    selected_text = _normalize_for_compare(user_text)
                    answers = list(question.fib_answers.all())
                    correct_texts = [answer.acceptable_text for answer in answers]
                    for candidate in answers:
                        candidate_value = _normalize_for_compare(candidate.acceptable_text, candidate.is_case_sensitive)
                        user_value = _normalize_for_compare(user_text, candidate.is_case_sensitive)
                        if user_value == candidate_value:
                            is_correct = True
                            break

                if is_correct:
                    correct_count += 1
                    earned_points += float(question.points or 1)
                
                # Trả về kết quả chi tiết kèm giải thích của giáo viên
                detail_results.append({
                    "question_id": q_id,
                    "question_type": question.question_type,
                    "is_correct": is_correct,
                    "selected_choice": str(user_choice or ''),
                    "selected_text": str(user_text or ''),
                    "correct_answer": correct_choice,
                    "correct_texts": correct_texts,
                    "explanation": question.explanation,
                    "points": float(question.points or 1),
                })

        # Tính điểm hệ 10
        score = round((earned_points / total_points) * 10, 2) if total_points > 0 else 0

        # Lưu lịch sử làm bài
        submission = QuizSubmission.objects.create(
            user=user,
            quiz=quiz,
            score=score,
            correct_count=correct_count,
            total_questions=total_questions,
            duration_seconds=max(int(duration_seconds or 0), 0)
        )

        answers_to_create = []
        for answer in user_answers:
            q_id = answer.get('question_id')
            user_choice = answer.get('choice') or answer.get('choice_id') or answer.get('selected_choice')
            user_text = answer.get('text') or answer.get('answer') or answer.get('selected_text') or ''
            if q_id in questions and (user_choice or user_text):
                question = questions[q_id]
                if question.question_type == 'MULTIPLE_CHOICE':
                    correct_choice = question.correct or ''
                    mcq_options = list(question.mcq_options.all())
                    if mcq_options:
                        correct_option = next((option for option in mcq_options if option.is_correct), None)
                        if correct_option:
                            correct_choice = str(correct_option.id)
                    selected_choice = str(user_choice or '')
                    is_correct = selected_choice == correct_choice
                    answers_to_create.append(
                        QuizSubmissionAnswer(
                            submission=submission,
                            question=question,
                            selected_choice=selected_choice,
                            selected_text='',
                            is_correct=is_correct
                        )
                    )
                else:
                    is_correct = False
                    answers = list(question.fib_answers.all())
                    for candidate in answers:
                        candidate_value = _normalize_for_compare(candidate.acceptable_text, candidate.is_case_sensitive)
                        user_value = _normalize_for_compare(user_text, candidate.is_case_sensitive)
                        if user_value == candidate_value:
                            is_correct = True
                            break
                    answers_to_create.append(
                        QuizSubmissionAnswer(
                            submission=submission,
                            question=question,
                            selected_choice='',
                            selected_text=str(user_text or ''),
                            is_correct=is_correct
                        )
                    )

        if answers_to_create:
            QuizSubmissionAnswer.objects.bulk_create(answers_to_create)

        return {
            "submission_id": submission.id,
            "score": score,
            "correct_count": correct_count,
            "total": total_questions,
            "duration_seconds": submission.duration_seconds,
            "details": detail_results
        }

    @staticmethod
    def get_user_history(user,quiz_type=None):
        """Lấy lịch sử làm bài của học viên"""
        queryset = QuizSubmission.objects.filter(user=user).select_related('quiz').order_by('-submitted_at')
        if quiz_type:
            queryset = queryset.filter(quiz__quiz_type = quiz_type)
        return queryset