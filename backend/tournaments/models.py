from django.db import models
from django.conf import settings

class Tournament(models.Model):
    TYPE_CHOICES = [('solo', 'Solo'), ('duo', 'Duo'), ('squad', 'Squad')]
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    prize_pool = models.CharField(max_length=100)
    entry_fee = models.PositiveIntegerField()
    total_slots = models.PositiveIntegerField(default=10)
    slots_filled = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default='upcoming')
    start_time = models.DateTimeField(null=True, blank=True)
    room_id = models.CharField(max_length=50, blank=True, default='')
    room_password = models.CharField(max_length=50, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='hosted_tournaments')

    def __str__(self):
        return self.title
