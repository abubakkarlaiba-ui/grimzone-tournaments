from rest_framework import generics, permissions
from .models import Tournament
from .serializers import TournamentSerializer

class TournamentList(generics.ListCreateAPIView):
    queryset = Tournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

class TournamentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
