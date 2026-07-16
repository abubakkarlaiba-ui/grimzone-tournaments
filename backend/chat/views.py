from rest_framework import generics, permissions
from .models import ChatMessage
from .serializers import ChatMessageSerializer
from django.conf import settings

try:
    import pusher
    pusher_client = pusher.Pusher(
        app_id=settings.PUSHER_APP_ID,
        key=settings.PUSHER_KEY,
        secret=settings.PUSHER_SECRET,
        cluster=settings.PUSHER_CLUSTER,
        ssl=True,
    )
except Exception:
    pusher_client = None

class ChatMessageListCreate(generics.ListCreateAPIView):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        chat_msg = serializer.save(user=self.request.user)
        if pusher_client:
            try:
                pusher_client.trigger('chat-room', 'new-message', {
                    'id': chat_msg.id,
                    'username': self.request.user.username,
                    'message': chat_msg.message,
                    'created_at': str(chat_msg.created_at),
                })
            except Exception:
                pass
