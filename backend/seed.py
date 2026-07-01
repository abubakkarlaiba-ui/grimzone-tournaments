import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from tournaments.models import Tournament

User = get_user_model()

# Create admin user
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser('admin', 'admin@grimzone.pk', 'admin123')
    admin.role = 'admin'
    admin.tokens = 999999
    admin.save()
    print('[OK] Admin created: admin / admin123')
else:
    print('[OK] Admin already exists')

# Create test player
if not User.objects.filter(username='player1').exists():
    player = User.objects.create_user('player1', 'player1@grimzone.pk', 'player123')
    player.tokens = 100
    player.save()
    print('[OK] Player created: player1 / player123')
else:
    print('[OK] Player already exists')

# Create sample tournaments
tournaments_data = [
    {'title': 'Grand Battle Royale', 'type': 'squad', 'prize_pool': '2000 PKR', 'entry_fee': 25, 'total_slots': 50, 'slots_filled': 18, 'status': 'upcoming'},
    {'title': 'Squad Showdown', 'type': 'squad', 'prize_pool': '1000 PKR', 'entry_fee': 15, 'total_slots': 24, 'slots_filled': 12, 'status': 'upcoming'},
    {'title': 'Duo Rush', 'type': 'duo', 'prize_pool': '800 PKR', 'entry_fee': 10, 'total_slots': 20, 'slots_filled': 8, 'status': 'upcoming'},
    {'title': 'Solo Clash', 'type': 'solo', 'prize_pool': '500 PKR', 'entry_fee': 5, 'total_slots': 12, 'slots_filled': 5, 'status': 'upcoming'},
]

for data in tournaments_data:
    _, created = Tournament.objects.get_or_create(
        title=data['title'],
        defaults=data
    )
    if created:
        print(f'[OK] Tournament created: {data["title"]}')
    else:
        print(f'[OK] Tournament already exists: {data["title"]}')

print('\n[OK] Seed complete!')
print('   Admin:  admin / admin123')
print('   Player: player1 / player123')
