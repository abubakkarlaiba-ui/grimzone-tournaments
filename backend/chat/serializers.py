from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'username', 'message', 'created_at']
        read_only_fields = ['created_at']
