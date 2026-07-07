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
        if user_id is None or amount is None:
            return Response({'error': 'userId and amount are required'}, status=400)
        try:
            user = User.objects.get(pk=user_id)
            user.tokens += int(amount)
            user.save()
            return Response({'status': 'ok', 'tokens': user.tokens})
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'User not found'}, status=404)

class AdminDeductTokensView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get('userId')
        amount = request.data.get('amount')
        if user_id is None or amount is None:
            return Response({'error': 'userId and amount are required'}, status=400)
        try:
            user = User.objects.get(pk=user_id)
            deduct = int(amount)
            if deduct <= 0:
                return Response({'error': 'Amount must be positive'}, status=400)
            if user.tokens < deduct:
                return Response({'error': f'User only has {user.tokens} tokens'}, status=400)
            user.tokens -= deduct
            user.save()
            return Response({'status': 'ok', 'tokens': user.tokens})
        except (User.DoesNotExist, ValueError):
            return Response({'error': 'User not found'}, status=404)

class AdminBookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminUserRoleUpdateView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        role = request.data.get('role')
        if role not in ['admin', 'player', 'owner']:
            return Response({'error': 'Invalid role'}, status=400)
        if role == 'owner' and request.user.role != 'owner':
            return Response({'error': 'Only the owner can assign owner role'}, status=403)
        try:
            user = User.objects.get(pk=pk)
            user.role = role
            user.is_staff = (role in ['admin', 'owner'])
            if role == 'owner':
                user.is_superuser = True
            user.save()
            return Response({'status': 'ok', 'user': UserSerializer(user).data})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

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

class AdminResetPasswordView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        if request.user.role != 'owner':
            return Response({'error': 'Only owner can reset passwords'}, status=403)
        new_password = request.data.get('password')
        if not new_password or len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=400)
        try:
            user = User.objects.get(pk=pk)
            user.set_password(new_password)
            user.save()
            return Response({'status': 'ok'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


