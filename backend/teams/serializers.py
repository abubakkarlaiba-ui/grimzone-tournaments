from rest_framework import serializers
from .models import Team, TeamMember
from accounts.serializers import UserSerializer

class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = ('id', 'user', 'joined_at')

class TeamSerializer(serializers.ModelSerializer):
    members = TeamMemberSerializer(many=True, read_only=True)
    tournament_title = serializers.CharField(source='tournament.title', read_only=True)
    tournament_type = serializers.CharField(source='tournament.type', read_only=True)

    class Meta:
        model = Team
        fields = ('code', 'creator', 'tournament', 'tournament_title', 'tournament_type',
                  'max_members', 'is_locked', 'created_at', 'members')

class CreateTeamSerializer(serializers.Serializer):
    tournament_title = serializers.CharField()

class JoinTeamSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
