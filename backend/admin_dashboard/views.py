from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from payments.models import Payment
from payments.serializers import PaymentSerializer
from tournaments.models import Tournament
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from accounts.serializers import UserSerializer

User = get_user_model()

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            'total_users': User.objects.count(),
            'total_tournaments': Tournament.objects.count(),
            'total_bookings': Booking.objects.count(),
            'pending_payments': Payment.objects.filter(status='pending').count(),
        })

class AdminPaymentListView(generics.ListAPIView):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminPaymentVerifyView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=404)

        action = request.data.get('action')
        if action == 'verify':
            payment.status = 'verified'
            user = payment.user
            user.tokens += payment.tokens
            user.save()
            payment.save()
            return Response({'status': 'verified'})
        elif action == 'reject':
            payment.status = 'rejected'
            payment.save()
            return Response({'status': 'rejected'})
        return Response({'error': 'Invalid action'}, status=400)

class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminAddTokensView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get('userId')
        amount = request.data.get('amount')
        try:
            user = User.objects.get(pk=user_id)
            user.tokens += int(amount)
            user.save()
            return Response({'status': 'ok', 'tokens': user.tokens})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class AdminBookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminRoomSetView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        booking_id = request.data.get('bookingId')
        room_id = request.data.get('roomId')
        room_password = request.data.get('roomPassword', '')
        try:
            booking = Booking.objects.get(pk=booking_id)
            booking.room_id = room_id
            booking.room_password = room_password
            booking.save()
            return Response({'status': 'ok'})
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=404)

class UpdateTournamentSlotsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        slot_map = {'solo': 50, 'duo': 25, 'squad': 12}
        updated = []
        for t in Tournament.objects.all():
            new_slots = slot_map.get(t.type)
            if new_slots and t.total_slots != new_slots:
                t.total_slots = new_slots
                if t.slots_filled > new_slots:
                    t.slots_filled = new_slots
                t.save()
                updated.append(f'{t.title}: {t.total_slots} -> {new_slots}')
        return Response({'status': 'ok', 'updated': updated})
