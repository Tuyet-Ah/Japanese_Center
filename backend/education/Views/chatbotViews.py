from rest_framework import permissions, status
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from education.serializers import JapaneseChatbotSerializer
from education.services import JapaneseChatbotService


class JapaneseChatbotView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser]

    def post(self, request):
        serializer = JapaneseChatbotSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        try:
            reply = JapaneseChatbotService.answer(
                data['message'],
                mode=data.get('mode', 'general'),
                history=data.get('history', []),
            )
            return Response({'reply': reply}, status=status.HTTP_200_OK)
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except RuntimeError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            return Response(
                {'error': 'Đã xảy ra lỗi khi tạo phản hồi từ Gemini.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )