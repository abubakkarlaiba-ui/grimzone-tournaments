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
        tournament_title = request.data.get('tournament_title')
        if not tournament_title:
            return Response({'error': 'tournament_title is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            tournament = Tournament.objects.get(title=tournament_title)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

        if tournament.slots_filled >= tournament.total_slots:
            return Response({'error': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if user.tokens < tournament.entry_fee:
            return Response({'error': f'Insufficient tokens. Need {tournament.entry_fee} FF, you have {user.tokens} FF'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.tokens -= tournament.entry_fee
        user.save()

        tournament.slots_filled += 1
        tournament.save()

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
