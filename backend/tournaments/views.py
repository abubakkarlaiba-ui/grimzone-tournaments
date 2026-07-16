from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import pusher
from django.conf import settings
from .models import Tournament
from .serializers import TournamentSerializer

pusher_client = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    cluster=settings.PUSHER_CLUSTER,
    ssl=True,
)

class IsCreatorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        is_admin = request.user.role in ('admin', 'owner')
        is_creator = obj.creator == request.user
        return is_admin or is_creator

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def get_queryset(self):
        qs = Tournament.objects.all().order_by('-created_at')
        mine = self.request.query_params.get('mine')
        if mine and self.request.user.is_authenticated:
            qs = qs.filter(creator=self.request.user)
        return qs

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        user = self.request.user
        tournament = serializer.save(creator=user)
        total_fees = tournament.total_slots * tournament.entry_fee
        if user.role in ('admin', 'owner'):
            if not tournament.prize_pool:
                tournament.prize_pool = f"{total_fees} PKR"
                tournament.save(update_fields=['prize_pool'])
        else:
            commission = int(total_fees * 0.05)
            prize = total_fees - commission
            tournament.prize_pool = f"{prize} PKR"
            tournament.save(update_fields=['prize_pool'])

class TournamentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsCreatorOrAdmin()]

class TournamentSetRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            tournament = Tournament.objects.get(pk=pk)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=404)

        is_admin = request.user.role in ('admin', 'owner')
        is_creator = tournament.creator == request.user
        if not is_admin and not is_creator:
            return Response({'error': 'Not allowed'}, status=403)

        room_id = request.data.get('room_id', '')
        room_password = request.data.get('room_password', '')
        tournament.room_id = room_id
        tournament.room_password = room_password
        tournament.save()

        try:
            pusher_client.trigger(f'tournament-{tournament.id}', 'room-updated', {
                'room_id': room_id,
                'room_password': room_password,
            })
        except Exception:
            pass

        return Response({
            'status': 'ok',
            'room_id': room_id,
            'room_password': room_password,
        })
