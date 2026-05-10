import json
import urllib.error
import urllib.request
import re

from django.conf import settings


class JapaneseChatbotService:
    SYSTEM_PROMPT = """Bạn là một Chuyên gia Giáo dục Tiếng Nhật (Japanese Sensei) thông minh, tận tâm và có kiến thức sâu rộng về ngôn ngữ cũng như văn hóa Nhật Bản.

NHIỆM VỤ:
- Giải đáp thắc mắc về ngữ pháp, từ vựng, Kanji từ cấp độ N5 đến N1.
- Phân tích câu tiếng Nhật: tách cấu trúc, chia động từ, giải thích nghĩa và sắc thái.
- Luôn cung cấp ít nhất 2 ví dụ minh họa cho mỗi cấu trúc ngữ pháp hoặc từ vựng mới.
- Khi ví dụ có Kanji, hãy ghi furigana theo dạng Kanji(かな) để người học dễ đọc.
- So sánh rõ các cấu trúc dễ nhầm lẫn như ~ように và ~ために.

QUY TẮC PHẢN HỒI:
- Trả lời bằng tiếng Việt rõ ràng, mạch lạc.
- Trình bày bằng Markdown.
- Bôi đậm từ khóa quan trọng.
- Nếu phù hợp, dùng bảng để trình bày từ vựng, cấu trúc, hoặc điểm so sánh.
- Tông giọng: khuyến khích, kiên nhẫn nhưng chuyên nghiệp.
- Nếu câu hỏi liên quan đến giao tiếp, hãy giải thích thêm về sắc thái như Keigo hoặc Tameguchi.
- Nếu người dùng hỏi ngoài phạm vi học tiếng Nhật, hãy từ chối khéo và nhắc họ tập trung vào bài học.

KHI PHÂN TÍCH CÂU:
- Xác định chủ ngữ, vị ngữ, trợ từ, động từ, tính từ và các thành phần quan trọng.
- Nếu có động từ, nêu rõ thể từ điển, thể ます, thể て, hoặc dạng chia liên quan nếu cần.
- Giải thích ý nghĩa tự nhiên theo ngữ cảnh.

KHI SO SÁNH:
- Nêu điểm giống, điểm khác, cách dùng, ngữ cảnh dùng, và lỗi dễ gặp.

KHÔNG ĐƯỢC:
- Không trả lời lan man ngoài chủ đề học tiếng Nhật.
- Không bỏ qua yêu cầu ví dụ.
- Không trả lời bằng tiếng Anh nếu không được yêu cầu."""

    @staticmethod
    def _build_prompt(message, mode='general', history=None):
        history = history or []
        history_text = []
        for item in history[-8:]:
            role = item.get('role', 'user')
            content = item.get('content', '').strip()
            if content:
                label = 'Người học' if role == 'user' else 'Sensei'
                history_text.append(f"{label}: {content}")

        history_block = "\n".join(history_text)

        instruction = {
            'grammar': 'Người học đang hỏi về ngữ pháp. Giải thích cấu trúc, cách dùng, ý nghĩa, sắc thái và lỗi thường gặp.',
            'vocab': 'Người học đang hỏi về từ vựng. Giải thích nghĩa, cách đọc, từ loại, sắc thái dùng, và đưa ví dụ.',
            'kanji': 'Người học đang hỏi về Kanji. Giải thích âm on, âm kun, bộ thủ nếu cần, và cách nhớ.',
            'sentence': 'Người học nhập một câu tiếng Nhật. Hãy phân tích câu chi tiết, chia động từ nếu có, và giải thích nghĩa tự nhiên.',
            'compare': 'Người học muốn so sánh hai hoặc nhiều cấu trúc. Hãy làm bảng so sánh rõ ràng.',
            'general': 'Trả lời theo vai trò Japanese Sensei, ưu tiên giải thích dễ hiểu, có ví dụ và văn phong khuyến khích.'
        }.get(mode, 'Trả lời theo vai trò Japanese Sensei, ưu tiên giải thích dễ hiểu, có ví dụ và văn phong khuyến khích.')

        parts = [
            f"MỤC TIÊU HIỆN TẠI: {instruction}",
        ]
        if history_block:
            parts.append(f"NGỮ CẢNH HỘI THOẠI GẦN ĐÂY:\n{history_block}")
        parts.append(f"CÂU HỎI NGƯỜI HỌC: {message.strip()}")
        parts.append(
            'Hãy trả lời bằng Markdown, ưu tiên các mục rõ ràng như: Tổng quan, Giải thích, Ví dụ 1, Ví dụ 2, So sánh (nếu cần), Lưu ý ghi nhớ.'
        )
        return "\n\n".join(parts)

    @staticmethod
    def answer(message, mode='general', history=None):
        api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if not api_key:
            raise ValueError('Chưa cấu hình GEMINI_API_KEY trong môi trường.')

        prompt = JapaneseChatbotService._build_prompt(message, mode=mode, history=history)
        configured_model = getattr(settings, 'GEMINI_MODEL', 'gemini-2.0-flash')
        model_candidates = [
            configured_model,
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash-001',
            'gemini-1.5-pro',
        ]

        seen_models = []
        for model in model_candidates:
            if model in seen_models:
                continue
            seen_models.append(model)

            payload = {
                'contents': [
                    {
                        'role': 'user',
                        'parts': [{'text': prompt}],
                    }
                ],
                'generationConfig': {
                    'temperature': 0.4,
                    'topP': 0.9,
                    'maxOutputTokens': 2048,
                },
                'systemInstruction': {
                    'parts': [{'text': JapaneseChatbotService.SYSTEM_PROMPT}],
                },
            }

            url = (
                f'https://generativelanguage.googleapis.com/v1beta/models/'
                f'{model}:generateContent?key={api_key}'
            )
            request = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST',
            )

            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    data = json.loads(response.read().decode('utf-8'))
            except urllib.error.HTTPError as exc:
                error_body = exc.read().decode('utf-8', errors='ignore')
                if exc.code == 404:
                    continue
                if exc.code == 429:
                    retry_match = re.search(r'Please retry in ([0-9.]+)s', error_body)
                    retry_text = retry_match.group(1) if retry_match else 'vài giây'
                    raise RuntimeError(
                        'Gemini hiện đang vượt hạn mức sử dụng cho key này. '
                        f'Hãy thử lại sau khoảng {retry_text} hoặc bật billing / đổi sang API key khác có quota.'
                    ) from exc
                raise RuntimeError(f'Gemini API lỗi: {error_body or exc.reason}') from exc
            except urllib.error.URLError as exc:
                raise RuntimeError(f'Không kết nối được tới Gemini API: {exc.reason}') from exc

            candidates = data.get('candidates', [])
            if not candidates:
                raise RuntimeError('Gemini không trả về nội dung phù hợp.')

            parts = candidates[0].get('content', {}).get('parts', [])
            answer_text = ''.join(part.get('text', '') for part in parts).strip()
            if not answer_text:
                raise RuntimeError('Gemini trả về phản hồi rỗng.')

            return answer_text

        raise RuntimeError(
            'Không tìm thấy model Gemini phù hợp. Hãy thử đặt GEMINI_MODEL=gemini-2.0-flash trong backend/.env.'
        )