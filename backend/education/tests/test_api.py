import hashlib
import hmac
from urllib.parse import urlencode

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase

from education.models import (
    CartItem,
    Chapter,
    Course,
    CourseReview,
    Enrollment,
    ForumResponse,
    ForumTopic,
    Lesson,
    LessonComment,
    LessonNote,
    Question,
    Quiz,
    QuizSubmission,
    User,
    UserProgress,
)


def _sign_vnpay(params, secret):
    filtered = {k: v for k, v in params.items() if k not in ["vnp_SecureHash", "vnp_SecureHashType"]}
    sorted_params = sorted(filtered.items())
    hash_data = urlencode(sorted_params, safe="")
    return hmac.new(secret.encode("utf-8"), hash_data.encode("utf-8"), hashlib.sha512).hexdigest()


class ApiTestBase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.password = "testpass123"
        cls.user = User.objects.create_user(
            username="student1",
            password=cls.password,
            email="student1@example.com",
            role="student",
        )
        cls.admin = User.objects.create_user(
            username="admin1",
            password=cls.password,
            email="admin1@example.com",
            role="admin",
        )

        cls.course = Course.objects.create(
            title="N5 Basic",
            description="Basic course",
            level="N5",
            price=100,
            thumbnail=SimpleUploadedFile("thumb.jpg", b"x", content_type="image/jpeg"),
        )
        cls.chapter = Chapter.objects.create(course=cls.course, title="Chapter 1", order=1)
        cls.lesson = Lesson.objects.create(
            chapter=cls.chapter,
            title="Lesson 1",
            video_url="http://example.com/video",
            order=1,
        )

        cls.quiz_practice = Quiz.objects.create(
            quiz_type="practice",
            title="Practice Quiz",
            time_limit=20,
            lesson=cls.lesson,
        )
        cls.quiz_final = Quiz.objects.create(
            quiz_type="final",
            title="Final Quiz",
            time_limit=30,
            chapter=cls.chapter,
        )
        cls.question1 = Question.objects.create(
            quiz=cls.quiz_practice,
            text="Q1",
            opt_a="A",
            opt_b="B",
            opt_c="C",
            opt_d="D",
            correct="A",
            explanation="E1",
        )
        cls.question2 = Question.objects.create(
            quiz=cls.quiz_practice,
            text="Q2",
            opt_a="A",
            opt_b="B",
            opt_c="C",
            opt_d="D",
            correct="B",
            explanation="E2",
        )

    def login(self, user, password=None):
        password = password or self.password
        response = self.client.post(
            "/educations/login/",
            {"username": user.username, "password": password},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data["access"]

    def auth(self, user):
        token = self.login(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


class AuthApiTests(ApiTestBase):
    def test_register_and_profile_flow(self):
        payload = {
            "username": "student2",
            "password": "pass12345",
            "email": "student2@example.com",
            "phone": "123",
        }
        response = self.client.post("/educations/register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        token = self.login(User.objects.get(username="student2"), password="pass12345")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        profile = self.client.get("/educations/profile/")
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data["username"], "student2")

        updated = self.client.patch(
            "/educations/profile/",
            {"full_name": "Student Two", "email": "student2_new@example.com", "phone": "456", "address": "HN"},
            format="json",
        )
        self.assertEqual(updated.status_code, status.HTTP_200_OK)
        self.assertEqual(updated.data["full_name"], "Student Two")
        self.assertEqual(updated.data["phone"], "456")

        password_change = self.client.post(
            "/educations/profile/change-password/",
            {"current_password": "pass12345", "new_password": "newpass123"},
            format="json",
        )
        self.assertEqual(password_change.status_code, status.HTTP_200_OK)

        self.client.credentials()
        new_token = self.login(User.objects.get(username="student2"), password="newpass123")
        self.assertTrue(new_token)

    def test_register_duplicate_username(self):
        payload = {"username": "student1", "password": "x", "email": "a@a.com"}
        response = self.client.post("/educations/register/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CourseApiTests(ApiTestBase):
    def test_course_list_filter_and_detail(self):
        response = self.client.get("/educations/courses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == self.course.id for item in response.data))

        response = self.client.get("/educations/courses/?search=Basic")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["id"] == self.course.id for item in response.data))

        detail = self.client.get(f"/educations/courses/{self.course.id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["id"], self.course.id)
        self.assertTrue(len(detail.data["chapters"]) > 0)

    def test_course_suggest(self):
        response = self.client.get("/educations/courses/suggest/?q=Basic")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)

    def test_course_reviews_require_purchase(self):
        self.auth(self.user)
        response = self.client.post(
            f"/educations/courses/{self.course.id}/reviews/",
            {"rating": 5, "comment": "good"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        Enrollment.objects.create(user=self.user, course=self.course, status="paid")
        response = self.client.post(
            f"/educations/courses/{self.course.id}/reviews/",
            {"rating": 4, "comment": "ok"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        reviews = self.client.get(f"/educations/courses/{self.course.id}/reviews/?rating=4")
        self.assertEqual(reviews.status_code, status.HTTP_200_OK)
        self.assertTrue(any(r["rating"] == 4 for r in reviews.data))

    def test_my_learning_progress(self):
        self.auth(self.user)

        Enrollment.objects.create(user=self.user, course=self.course, status="paid")
        UserProgress.objects.create(user=self.user, lesson=self.lesson, is_completed=True)

        response = self.client.get("/educations/my-learning/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["course_id"] == self.course.id for item in response.data))
        course_item = next(item for item in response.data if item["course_id"] == self.course.id)
        self.assertEqual(course_item["progress_percentage"], 100)


class CartApiTests(ApiTestBase):
    def test_cart_crud(self):
        self.auth(self.user)

        response = self.client.post("/educations/cart/", {"course_id": self.course.id}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.get("/educations/cart/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["cart_items"]), 1)

        duplicate = self.client.post("/educations/cart/", {"course_id": self.course.id}, format="json")
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)

        item_id = response.data["cart_items"][0]["id"]
        deleted = self.client.delete(f"/educations/cart/{item_id}/")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)


@override_settings(
    VNPAY_TMN_CODE="TEST",
    VNPAY_HASH_SECRET="SECRET",
    VNPAY_PAYMENT_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    VNPAY_RETURN_URL="http://127.0.0.1:8000/educations/vnpay/return/",
    VNPAY_IPN_URL="http://127.0.0.1:8000/educations/vnpay/ipn/",
    VNPAY_FRONTEND_RETURN_URL="",
)
class PaymentApiTests(ApiTestBase):
    def test_checkout_and_vnpay_callbacks(self):
        self.auth(self.user)

        CartItem.objects.create(user=self.user, course=self.course)

        checkout = self.client.post(
            "/educations/checkout/",
            {"course_ids": [self.course.id]},
            format="json",
        )
        self.assertEqual(checkout.status_code, status.HTTP_200_OK)
        self.assertIn("payment_url", checkout.data)
        txn_ref = checkout.data["txn_ref"]

        params = {
            "vnp_TxnRef": txn_ref,
            "vnp_ResponseCode": "00",
            "vnp_TransactionStatus": "00",
            "vnp_Amount": "10000",
        }
        params["vnp_SecureHash"] = _sign_vnpay(params, settings.VNPAY_HASH_SECRET)

        ret = self.client.get("/educations/vnpay/return/", params)
        self.assertEqual(ret.status_code, status.HTTP_200_OK)
        self.assertEqual(ret.data["status"], "success")

        ipn = self.client.get("/educations/vnpay/ipn/", params)
        self.assertEqual(ipn.status_code, status.HTTP_200_OK)
        self.assertEqual(ipn.data["RspCode"], "00")

        enrollment = Enrollment.objects.get(user=self.user, course=self.course)
        self.assertEqual(enrollment.status, "paid")
        self.assertFalse(CartItem.objects.filter(user=self.user, course=self.course).exists())

    def test_checkout_success_updates_rejected_enrollment_to_paid(self):
        self.auth(self.user)

        Enrollment.objects.create(user=self.user, course=self.course, status="rejected")
        CartItem.objects.create(user=self.user, course=self.course)

        checkout = self.client.post(
            "/educations/checkout/",
            {"course_ids": [self.course.id]},
            format="json",
        )
        self.assertEqual(checkout.status_code, status.HTTP_200_OK)
        txn_ref = checkout.data["txn_ref"]

        params = {
            "vnp_TxnRef": txn_ref,
            "vnp_ResponseCode": "00",
            "vnp_TransactionStatus": "00",
            "vnp_Amount": "10000",
        }
        params["vnp_SecureHash"] = _sign_vnpay(params, settings.VNPAY_HASH_SECRET)

        ret = self.client.get("/educations/vnpay/return/", params)
        self.assertEqual(ret.status_code, status.HTTP_200_OK)

        enrollment = Enrollment.objects.get(user=self.user, course=self.course)
        self.assertEqual(enrollment.status, "paid")


class QuizApiTests(ApiTestBase):
    def test_quiz_detail_submit_and_review(self):
        self.auth(self.user)

        detail = self.client.get(f"/educations/quizzes/{self.quiz_practice.id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertIn("questions", detail.data)
        self.assertNotIn("correct", detail.data["questions"][0])

        submit = self.client.post(
            f"/educations/quizzes/{self.quiz_practice.id}/submit/",
            {
                "answers": [
                    {"question_id": self.question1.id, "choice": "A"},
                    {"question_id": self.question2.id, "choice": "B"},
                ]
            },
            format="json",
        )
        self.assertEqual(submit.status_code, status.HTTP_200_OK)
        self.assertIn("submission_id", submit.data)

        review = self.client.get(f"/educations/quizzes/{self.quiz_practice.id}/review/")
        self.assertEqual(review.status_code, status.HTTP_200_OK)
        self.assertIn("correct", review.data[0])

    def test_quiz_history_and_leaderboard(self):
        self.auth(self.user)

        QuizSubmission.objects.create(user=self.user, quiz=self.quiz_practice, score=8)
        QuizSubmission.objects.create(user=self.user, quiz=self.quiz_final, score=9)

        history_practice = self.client.get("/educations/quiz-history/practice/")
        self.assertEqual(history_practice.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["quiz_name"] == self.quiz_practice.title for item in history_practice.data))

        history_final = self.client.get("/educations/quiz-history/final/")
        self.assertEqual(history_final.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item["quiz_name"] == self.quiz_final.title for item in history_final.data))

        leaderboard = self.client.get(f"/educations/quizzes/{self.quiz_final.id}/leaderboard/")
        self.assertEqual(leaderboard.status_code, status.HTTP_200_OK)
        self.assertTrue(len(leaderboard.data) > 0)


class LessonApiTests(ApiTestBase):
    def test_lesson_detail_requires_payment(self):
        self.auth(self.user)

        forbidden = self.client.get(f"/educations/lessons/{self.lesson.id}/")
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        Enrollment.objects.create(user=self.user, course=self.course, status="paid")
        allowed = self.client.get(f"/educations/lessons/{self.lesson.id}/")
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)

    def test_admin_can_view_lesson(self):
        self.auth(self.admin)
        allowed = self.client.get(f"/educations/lessons/{self.lesson.id}/")
        self.assertEqual(allowed.status_code, status.HTTP_200_OK)

    def test_mark_lesson_complete(self):
        self.auth(self.user)
        Enrollment.objects.create(user=self.user, course=self.course, status="paid")

        response = self.client.post(f"/educations/lessons/{self.lesson.id}/complete/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = UserProgress.objects.get(user=self.user, lesson=self.lesson)
        self.assertTrue(progress.is_completed)


class InteractionApiTests(ApiTestBase):
    def test_comments_and_notes(self):
        self.auth(self.user)

        comment = self.client.post(
            f"/educations/lessons/{self.lesson.id}/comments/",
            {"content": "Nice"},
            format="json",
        )
        self.assertEqual(comment.status_code, status.HTTP_201_CREATED)
        self.assertTrue(LessonComment.objects.filter(lesson=self.lesson).exists())

        comments = self.client.get(f"/educations/lessons/{self.lesson.id}/comments/")
        self.assertEqual(comments.status_code, status.HTTP_200_OK)

        note = self.client.post(
            "/educations/notes/",
            {"lesson_id": self.lesson.id, "content": "Note", "video_timestamp": 10},
            format="json",
        )
        self.assertEqual(note.status_code, status.HTTP_200_OK)
        self.assertTrue(LessonNote.objects.filter(lesson=self.lesson).exists())

    def test_forum_topics_and_replies(self):
        self.auth(self.user)

        topic = self.client.post(
            "/educations/forum/topics/",
            {"title": "Help", "category": "grammar", "content": "Question"},
            format="json",
        )
        self.assertEqual(topic.status_code, status.HTTP_201_CREATED)

        list_topics = self.client.get("/educations/forum/topics/")
        self.assertEqual(list_topics.status_code, status.HTTP_200_OK)
        self.assertTrue(len(list_topics.data) > 0)

        topic_id = ForumTopic.objects.first().id
        reply = self.client.post(
            f"/educations/forum/topics/{topic_id}/reply/",
            {"content": "Answer"},
            format="json",
        )
        self.assertEqual(reply.status_code, status.HTTP_201_CREATED)

        responses = self.client.get(f"/educations/forum/topics/{topic_id}/response/")
        self.assertEqual(responses.status_code, status.HTTP_200_OK)
        self.assertTrue(len(responses.data) > 0)


class LearningProgressApiTests(ApiTestBase):
    def test_my_learning_progress(self):
        self.auth(self.user)

        Enrollment.objects.create(user=self.user, course=self.course, status="paid")
        UserProgress.objects.create(user=self.user, lesson=self.lesson, is_completed=True)

        response = self.client.get("/educations/my-learning/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) > 0)
