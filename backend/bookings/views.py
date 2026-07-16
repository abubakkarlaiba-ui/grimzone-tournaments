from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer
from tournaments.models import Tournament

class BookingListCreate(generics.ListCreateAPIView):
    serializer_class = BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        tournament_id = request.data.get('tournament_id')
        if not tournament_id:
            return Response({'error': 'tournament_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

        if tournament.slots_filled >= tournament.total_slots:
            return Response({'error': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if user.tokens < tournament.entry_fee:
            return Response({'error': f'Insufficient tokens. Need {tournament.entry_fee} FF, you have {user.tokens} FF'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['tournament_title'] = tournament.title
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        user.tokens -= tournament.entry_fee
        user.save()

        tournament.slots_filled += 1
        tournament.save()

        serializer.save(user=self.request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
