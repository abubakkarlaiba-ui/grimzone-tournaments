import secrets
import string
from django.db import models
from django.conf import settings
from tournaments.models import Tournament

def generate_code():
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(secrets.choice(chars) for _ in range(6))
        if not Team.objects.filter(code=code).exists():
            return code

class Team(models.Model):
    code = models.CharField(max_length=6, unique=True, default=generate_code)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_teams')
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='teams')
    max_members = models.PositiveIntegerField(default=2)
    is_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.tournament.title} ({self.members.count()}/{self.max_members})"

class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='team_memberships')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('team', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.team.code}"
