"""
ExamService — Business logic cho hệ thống Thi Online (JLPT & Điền từ).

Chức năng chính:
  1. CRUD đề thi (Deep Insert / Upsert / Delete)
  2. Chấm điểm bài thi
"""

from django.db import transaction

from education.models import (
    Exam, ExamSection, QuestionGroup, ExamQuestion, McqOption, FibAnswer,
)


class ExamService:

    # ─────────────────────────────────────────────
    # 1. READ
    # ─────────────────────────────────────────────

    @staticmethod
    def list_exams(filters: dict):
        """Lọc danh sách đề thi theo level và status."""
        qs = Exam.objects.all()
        if filters.get('level'):
            qs = qs.filter(level=filters['level'])
        if filters.get('status'):
            qs = qs.filter(status=filters['status'])
        if filters.get('search'):
            qs = qs.filter(title__icontains=filters['search'])
        return qs

    @staticmethod
    def get_exam_detail(exam_id: int) -> Exam:
        """
        Lấy đề thi kèm toàn bộ cây con.
        Dùng prefetch_related để tránh N+1 query.
        """
        return (
            Exam.objects
            .prefetch_related(
                'sections',
                'sections__question_groups',
                'sections__question_groups__questions',
                'sections__question_groups__questions__mcq_options',
                'sections__question_groups__questions__fib_answers',
            )
            .get(pk=exam_id)
        )

    # ─────────────────────────────────────────────
    # 2. CREATE (Deep Insert)
    # ─────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def create_exam(validated_data: dict) -> Exam:
        sections_data = validated_data.pop('sections', [])

        exam = Exam.objects.create(**validated_data)

        for sec_data in sections_data:
            groups_data = sec_data.pop('question_groups', [])
            section = ExamSection.objects.create(exam=exam, **sec_data)

            for grp_data in groups_data:
                questions_data = grp_data.pop('questions', [])
                group = QuestionGroup.objects.create(section=section, **grp_data)

                for q_data in questions_data:
                    mcq_data = q_data.pop('mcq_options', [])
                    fib_data = q_data.pop('fib_answers', [])
                    question = ExamQuestion.objects.create(group=group, **q_data)

                    if question.question_type == 'MULTIPLE_CHOICE':
                        McqOption.objects.bulk_create([
                            McqOption(question=question, **opt)
                            for opt in mcq_data
                        ])
                    elif question.question_type == 'FILL_IN_BLANK':
                        FibAnswer.objects.bulk_create([
                            FibAnswer(question=question, **ans)
                            for ans in fib_data
                        ])

        return ExamService.get_exam_detail(exam.pk)

    # ─────────────────────────────────────────────
    # 3. UPDATE (Upsert toàn bộ cây — xoá những gì không còn trong payload)
    # ─────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def update_exam(exam: Exam, validated_data: dict) -> Exam:
        sections_data = validated_data.pop('sections', None)

        # Cập nhật các trường của Exam
        for attr, value in validated_data.items():
            setattr(exam, attr, value)
        exam.save()

        if sections_data is None:
            # Không gửi sections → không chạm đến cấu trúc con
            return ExamService.get_exam_detail(exam.pk)

        # ── Upsert Sections ──
        incoming_section_ids = [s['id'] for s in sections_data if s.get('id')]
        # Xoá những section không có trong payload
        exam.sections.exclude(pk__in=incoming_section_ids).delete()

        for sec_data in sections_data:
            sec_id = sec_data.pop('id', None)
            groups_data = sec_data.pop('question_groups', [])

            if sec_id:
                section, _ = ExamSection.objects.update_or_create(
                    pk=sec_id, defaults={**sec_data, 'exam': exam}
                )
            else:
                section = ExamSection.objects.create(exam=exam, **sec_data)

            # ── Upsert Groups ──
            incoming_group_ids = [g['id'] for g in groups_data if g.get('id')]
            section.question_groups.exclude(pk__in=incoming_group_ids).delete()

            for grp_data in groups_data:
                grp_id = grp_data.pop('id', None)
                questions_data = grp_data.pop('questions', [])

                if grp_id:
                    group, _ = QuestionGroup.objects.update_or_create(
                        pk=grp_id, defaults={**grp_data, 'section': section}
                    )
                else:
                    group = QuestionGroup.objects.create(section=section, **grp_data)

                # ── Upsert Questions ──
                incoming_q_ids = [q['id'] for q in questions_data if q.get('id')]
                group.questions.exclude(pk__in=incoming_q_ids).delete()

                for q_data in questions_data:
                    q_id = q_data.pop('id', None)
                    mcq_data = q_data.pop('mcq_options', [])
                    fib_data = q_data.pop('fib_answers', [])

                    if q_id:
                        question, _ = ExamQuestion.objects.update_or_create(
                            pk=q_id, defaults={**q_data, 'group': group}
                        )
                    else:
                        question = ExamQuestion.objects.create(group=group, **q_data)

                    # Xoá toàn bộ options/answers cũ rồi tạo lại (đơn giản và an toàn)
                    question.mcq_options.all().delete()
                    question.fib_answers.all().delete()

                    if question.question_type == 'MULTIPLE_CHOICE':
                        McqOption.objects.bulk_create([
                            McqOption(question=question, **opt) for opt in mcq_data
                        ])
                    elif question.question_type == 'FILL_IN_BLANK':
                        FibAnswer.objects.bulk_create([
                            FibAnswer(question=question, **ans) for ans in fib_data
                        ])

        return ExamService.get_exam_detail(exam.pk)

    # ─────────────────────────────────────────────
    # 4. DELETE
    # ─────────────────────────────────────────────

    @staticmethod
    def delete_exam(exam: Exam):
        """Cascade delete toàn bộ cây (Django tự xử lý nhờ on_delete=CASCADE)."""
        exam.delete()

    # ─────────────────────────────────────────────
    # 5. GRADING SERVICE — Chấm điểm bài thi
    # ─────────────────────────────────────────────

    @staticmethod
    def grade_submission(exam_id: int, user_answers: list) -> dict:
        """
        Chấm điểm bài thi dựa trên danh sách đáp án người dùng.

        user_answers: [
            { "question_id": 1, "selected_option_id": 5 },   # MCQ
            { "question_id": 2, "text_answer": "東京" },       # FIB
        ]

        Trả về:
        {
            "total_score":  ...,   # Điểm đạt được
            "max_score":    ...,   # Điểm tối đa của đề
            "correct_count": ...,
            "total_questions": ...,
            "details": [ { question_id, is_correct, points_earned, correct_answer }, ... ]
        }
        """
        exam = (
            Exam.objects
            .prefetch_related(
                'sections__question_groups__questions__mcq_options',
                'sections__question_groups__questions__fib_answers',
            )
            .get(pk=exam_id)
        )

        # Xây map: question_id → ExamQuestion object
        question_map: dict[int, ExamQuestion] = {}
        for section in exam.sections.all():
            for group in section.question_groups.all():
                for question in group.questions.all():
                    question_map[question.pk] = question

        # Index đáp án người dùng: question_id → answer_data
        answer_index = {int(a['question_id']): a for a in user_answers}

        total_score = 0
        correct_count = 0
        details = []

        for q_id, question in question_map.items():
            user_ans = answer_index.get(q_id, {})
            is_correct = False
            correct_answer_repr = None

            if question.question_type == 'MULTIPLE_CHOICE':
                is_correct, correct_answer_repr = ExamService._grade_mcq(
                    question, user_ans.get('selected_option_id')
                )

            elif question.question_type == 'FILL_IN_BLANK':
                is_correct, correct_answer_repr = ExamService._grade_fib(
                    question, user_ans.get('text_answer')
                )

            points_earned = question.points if is_correct else 0
            total_score += points_earned
            if is_correct:
                correct_count += 1

            details.append({
                'question_id':        q_id,
                'question_type':      question.question_type,
                'is_correct':         is_correct,
                'points_earned':      points_earned,
                'correct_answer':     correct_answer_repr,
                'explain_text':       question.explain_text or '',
                # Lưu lại đáp án người dùng đã chọn để xem lại bài
                'selected_option_id': user_ans.get('selected_option_id'),
                'user_text_answer':   user_ans.get('text_answer'),
            })

        return {
            'total_score':     total_score,
            'max_score':       exam.total_score,
            'correct_count':   correct_count,
            'total_questions': len(question_map),
            'details':         details,
        }

    # ── Private helpers ──

    @staticmethod
    def _grade_mcq(question: ExamQuestion, selected_option_id) -> tuple[bool, str | None]:
        """
        So sánh ID option người dùng chọn với bản ghi có is_correct=True.
        """
        correct_option = question.mcq_options.filter(is_correct=True).first()
        if correct_option is None:
            return False, None  # Câu hỏi chưa có đáp án đúng

        correct_answer_repr = correct_option.content
        if selected_option_id is None:
            return False, correct_answer_repr

        is_correct = int(selected_option_id) == correct_option.pk
        return is_correct, correct_answer_repr

    @staticmethod
    def _grade_fib(question: ExamQuestion, text_answer) -> tuple[bool, str | None]:
        """
        Chuẩn hoá text bằng .strip() rồi so khớp với bất kỳ acceptable_text nào.
        Tôn trọng cờ is_case_sensitive của từng bản ghi FibAnswer.
        """
        acceptable_answers = list(question.fib_answers.all())
        if not acceptable_answers:
            return False, None

        # Hiển thị tất cả đáp án hợp lệ cho người dùng xem
        correct_answer_repr = ' / '.join(a.acceptable_text for a in acceptable_answers)

        if text_answer is None:
            return False, correct_answer_repr

        normalized_input = str(text_answer).strip()

        for answer in acceptable_answers:
            expected = answer.acceptable_text.strip()
            if answer.is_case_sensitive:
                if normalized_input == expected:
                    return True, correct_answer_repr
            else:
                if normalized_input.lower() == expected.lower():
                    return True, correct_answer_repr

        return False, correct_answer_repr
