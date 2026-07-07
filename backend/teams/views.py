from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Team, TeamMember
from .serializers import TeamSerializer, CreateTeamSerializer, JoinTeamSerializer
from tournaments.models import Tournament
from bookings.models import Booking

class TeamCreateView(generics.CreateAPIView):
    serializer_class = CreateTeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tournament_title = serializer.validated_data['tournament_title']
        try:
            tournament = Tournament.objects.get(title=tournament_title)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found'}, status=status.HTTP_404_NOT_FOUND)

        if tournament.type == 'solo':
            return Response({'error': 'Cannot create team for solo tournaments'}, status=status.HTTP_400_BAD_REQUEST)

        if tournament.slots_filled >= tournament.total_slots:
            return Response({'error': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if user.tokens < tournament.entry_fee:
            return Response({'error': f'Insufficient tokens. Need {tournament.entry_fee} FF, you have {user.tokens} FF'}, status=status.HTTP_400_BAD_REQUEST)

        max_members = 2 if tournament.type == 'duo' else 4
        team = Team.objects.create(
            creator=user,
            tournament=tournament,
            max_members=max_members,
        )

        user.tokens -= tournament.entry_fee
        user.save()

        tournament.slots_filled += 1
        tournament.save()

        TeamMember.objects.create(team=team, user=user)

        Booking.objects.create(user=user, tournament_title=tournament.title)

        return Response({
            'code': team.code,
            'tournament_title': tournament.title,
            'tournament_type': tournament.type,
            'max_members': max_members,
            'members': [{'username': user.username, 'freefire_name': user.freefire_name}],
        }, status=status.HTTP_201_CREATED)


class TeamJoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = JoinTeamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code'].upper()
        try:
            team = Team.objects.get(code=code)
        except Team.DoesNotExist:
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)

        if team.is_locked:
            return Response({'error': 'Team is already full'}, status=status.HTTP_400_BAD_REQUEST)

        if TeamMember.objects.filter(team=team, user=request.user).exists():
            return Response({'error': 'You are already in this team'}, status=status.HTTP_400_BAD_REQUEST)

        tournament = team.tournament
        if tournament.slots_filled >= tournament.total_slots:
            return Response({'error': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if user.tokens < tournament.entry_fee:
            return Response({'error': f'Insufficient tokens. Need {tournament.entry_fee} FF, you have {user.tokens} FF'}, status=status.HTTP_400_BAD_REQUEST)

        user.tokens -= tournament.entry_fee
        user.save()

        tournament.slots_filled += 1
        tournament.save()

        TeamMember.objects.create(team=team, user=user)

        Booking.objects.create(user=user, tournament_title=tournament.title)

        current_count = team.members.count()
        if current_count >= team.max_members:
            team.is_locked = True
            team.save()

        return Response({
            'code': team.code,
            'tournament_title': tournament.title,
            'message': f'Joined team. Members: {current_count}/{team.max_members}',
            'is_locked': team.is_locked,
        })


class TeamDetailView(generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    lookup_field = 'code'
    permission_classes = [permissions.IsAuthenticated]


class MyTeamsView(generics.ListAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        created = Team.objects.filter(creator=user)
        joined = Team.objects.filter(members__user=user)
        return (created | joined).distinct().order_by('-created_at')
