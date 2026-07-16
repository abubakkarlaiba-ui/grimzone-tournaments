from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)
        if not user:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        if user:
            if user.is_banned:
                return Response({'error': 'Account banned'}, status=403)
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
            })
        return Response({'error': 'Invalid credentials'}, status=401)

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

class UserStatsView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        from bookings.models import Booking
        tournaments_played = Booking.objects.filter(user=user).count()
        serializer = self.get_serializer(user)
        return Response({
            **serializer.data,
            'tournaments_played': tournaments_played,
        })

class SiteStatsView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from tournaments.models import Tournament
        return Response({
            'total_users': User.objects.count(),
            'total_tournaments': Tournament.objects.count(),
        })

class ChangePasswordView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')

        if not user.check_password(old_password):
            return Response({'error': 'Current password is incorrect'}, status=400)

        if len(new_password) < 6:
            return Response({'error': 'New password must be at least 6 characters'}, status=400)

        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({'error': ' '.join(e.messages)}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'})
