from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
import pusher
from django.conf import settings

User = get_user_model()

pusher_client = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    cluster=settings.PUSHER_CLUSTER,
    ssl=True,
)

class WalletView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({'tokens': request.user.tokens})

class TransferTokensView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        username = request.data.get('username', '').strip()
        try:
            amount = int(request.data.get('amount', 0))
        except (TypeError, ValueError):
            return Response({'error': 'Invalid amount'}, status=400)

        if amount <= 0:
            return Response({'error': 'Amount must be positive'}, status=400)

        if request.user.username == username:
            return Response({'error': 'Cannot send tokens to yourself'}, status=400)

        try:
            recipient = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

        sender = request.user
        if sender.tokens < amount:
            return Response({'error': f'Insufficient tokens. You have {sender.tokens}'}, status=400)

        sender.tokens -= amount
        sender.save()
        recipient.tokens += amount
        recipient.save()

        try:
            pusher_client.trigger(f'user-{recipient.id}', 'tokens-updated', {
                'user_id': recipient.id,
                'balance': recipient.tokens,
            })
            pusher_client.trigger(f'user-{sender.id}', 'tokens-updated', {
                'user_id': sender.id,
                'balance': sender.tokens,
            })
        except Exception:
            pass

        return Response({
            'status': 'ok',
            'sent': amount,
            'recipient': recipient.username,
            'balance': sender.tokens,
        })
