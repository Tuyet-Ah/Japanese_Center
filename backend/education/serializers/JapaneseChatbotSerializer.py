from rest_framework import serializers


class ChatHistoryMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=('user', 'assistant'))
    content = serializers.CharField()


class JapaneseChatbotSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)
    mode = serializers.ChoiceField(
        choices=('general', 'grammar', 'vocab', 'kanji', 'sentence', 'compare'),
        default='general',
        required=False,
    )
    history = ChatHistoryMessageSerializer(many=True, required=False)