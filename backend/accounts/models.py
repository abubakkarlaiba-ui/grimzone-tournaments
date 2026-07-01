from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [('player', 'Player'), ('admin', 'Admin')]
    tokens = models.PositiveIntegerField(default=0)
    phone = models.CharField(max_length=20, blank=True)
    is_banned = models.BooleanField(default=False)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='player')
