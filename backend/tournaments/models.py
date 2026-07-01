from django.db import models

class Tournament(models.Model):
    TYPE_CHOICES = [('solo', 'Solo'), ('duo', 'Duo'), ('squad', 'Squad')]
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    prize_pool = models.CharField(max_length=100)
    entry_fee = models.PositiveIntegerField()
    total_slots = models.PositiveIntegerField(default=10)
    slots_filled = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default='upcoming')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
