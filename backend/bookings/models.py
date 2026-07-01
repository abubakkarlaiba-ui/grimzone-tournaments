from django.db import models
from django.conf import settings

class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    tournament_title = models.CharField(max_length=200)
    room_id = models.CharField(max_length=50, blank=True)
    room_password = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.tournament_title}"
