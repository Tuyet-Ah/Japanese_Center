from django.core.management.base import BaseCommand
from django.db import transaction

from education.models import (
    FIBAnswer,
    MCQOption,
    Question,
    QuestionGroup,
    Quiz,
    Section,
)


class Command(BaseCommand):
    help = "Create or refresh a sample hierarchical exam for JLPT and fill-in-the-blank testing."

    @transaction.atomic
    def handle(self, *args, **options):
        quiz_title = "Đề mẫu JLPT N5 - Trắc nghiệm & Điền từ"

        Quiz.objects.filter(title=quiz_title).delete()

        quiz = Quiz.objects.create(
            quiz_type="practice",
            title=quiz_title,
            time_limit=30,
            total_score=10,
            status="published",
            level="N5",
        )

        vocab_section = Section.objects.create(
            quiz=quiz,
            name="Phần 1: Từ vựng",
            max_score=3,
            order_index=1,
        )
        reading_section = Section.objects.create(
            quiz=quiz,
            name="Phần 2: Ngữ pháp & Đọc hiểu",
            max_score=3,
            order_index=2,
        )
        listening_section = Section.objects.create(
            quiz=quiz,
            name="Phần 3: Điền từ",
            max_score=3,
            order_index=3,
        )

        vocab_group = QuestionGroup.objects.create(
            section=vocab_section,
            instruction="Chọn đáp án đúng cho mỗi câu hỏi từ vựng dưới đây.",
            group_type="vocabulary",
            order_index=1,
        )
        grammar_group = QuestionGroup.objects.create(
            section=reading_section,
            instruction="Chọn đáp án đúng để hoàn thành câu ngữ pháp.",
            group_type="grammar",
            order_index=1,
        )
        reading_group = QuestionGroup.objects.create(
            section=reading_section,
            instruction="Đọc đoạn văn sau và trả lời câu hỏi.",
            passage_text=(
                "毎朝、私は七時に起きて、パンを食べます。\n"
                "そのあと、駅まで歩いて会社へ行きます。\n"
                "夜は家で日本語を勉強します。"
            ),
            group_type="reading",
            order_index=1,
        )
        blank_group = QuestionGroup.objects.create(
            section=listening_section,
            instruction="Điền từ phù hợp vào chỗ trống.",
            audio_url="https://example.com/audio/jlpt-n5-sample.mp3",
            group_type="listening",
            order_index=1,
        )

        q1 = Question.objects.create(
            quiz=quiz,
            group=vocab_group,
            question_number=1,
            text="毎日、私は日本語を ___。",
            question_type="MULTIPLE_CHOICE",
            points=1,
            explanation="Câu này diễn tả hành động học tiếng Nhật mỗi ngày.",
        )
        MCQOption.objects.bulk_create([
            MCQOption(question=q1, content="A. 勉強します", is_correct=True, order_index=1),
            MCQOption(question=q1, content="B. 勉強しました", is_correct=False, order_index=2),
            MCQOption(question=q1, content="C. 勉強しています", is_correct=False, order_index=3),
            MCQOption(question=q1, content="D. 勉強しません", is_correct=False, order_index=4),
        ])

        q2 = Question.objects.create(
            quiz=quiz,
            group=vocab_group,
            question_number=2,
            text="この言葉の読み方として最もよいものを、1・2・3・4から一つ選んでください。 先週、デパートで買い物をしました。",
            question_type="MULTIPLE_CHOICE",
            points=1,
            explanation="'買い物' は 'かいもの' と読みます.",
        )
        MCQOption.objects.bulk_create([
            MCQOption(question=q2, content="A. かいもの", is_correct=True, order_index=1),
            MCQOption(question=q2, content="B. かもの", is_correct=False, order_index=2),
            MCQOption(question=q2, content="C. かいもん", is_correct=False, order_index=3),
            MCQOption(question=q2, content="D. ものかい", is_correct=False, order_index=4),
        ])

        q3 = Question.objects.create(
            quiz=quiz,
            group=grammar_group,
            question_number=3,
            text="私は毎朝パンを ___ 会社へ行きます。",
            question_type="MULTIPLE_CHOICE",
            points=1,
            explanation="'食べて' phù hợp với cấu trúc hành động nối tiếp.",
        )
        MCQOption.objects.bulk_create([
            MCQOption(question=q3, content="A. 食べて", is_correct=True, order_index=1),
            MCQOption(question=q3, content="B. 食べます", is_correct=False, order_index=2),
            MCQOption(question=q3, content="C. 食べました", is_correct=False, order_index=3),
            MCQOption(question=q3, content="D. 食べない", is_correct=False, order_index=4),
        ])

        q4 = Question.objects.create(
            quiz=quiz,
            group=reading_group,
            question_number=4,
            text="私は毎朝何時に起きますか。",
            question_type="MULTIPLE_CHOICE",
            points=1,
            explanation="Đoạn văn nói rõ '七時に起きて'.",
        )
        MCQOption.objects.bulk_create([
            MCQOption(question=q4, content="A. 六時", is_correct=False, order_index=1),
            MCQOption(question=q4, content="B. 七時", is_correct=True, order_index=2),
            MCQOption(question=q4, content="C. 八時", is_correct=False, order_index=3),
            MCQOption(question=q4, content="D. 九時", is_correct=False, order_index=4),
        ])

        q5 = Question.objects.create(
            quiz=quiz,
            group=blank_group,
            question_number=5,
            text="毎朝、私はコーヒーを ___。",
            question_type="FILL_IN_BLANK",
            points=1,
            explanation="Đáp án đúng là '飲みます'.",
        )
        FIBAnswer.objects.bulk_create([
            FIBAnswer(question=q5, acceptable_text="飲みます", is_case_sensitive=False),
            FIBAnswer(question=q5, acceptable_text="のみます", is_case_sensitive=False),
        ])

        q6 = Question.objects.create(
            quiz=quiz,
            group=blank_group,
            question_number=6,
            text="私は駅まで ___ 会社へ行きます。",
            question_type="FILL_IN_BLANK",
            points=1,
            explanation="Từ phù hợp là '歩いて'.",
        )
        FIBAnswer.objects.bulk_create([
            FIBAnswer(question=q6, acceptable_text="歩いて", is_case_sensitive=False),
            FIBAnswer(question=q6, acceptable_text="あるいて", is_case_sensitive=False),
        ])

        self.stdout.write(self.style.SUCCESS(f"Created sample exam: {quiz.title} (id={quiz.id})"))
