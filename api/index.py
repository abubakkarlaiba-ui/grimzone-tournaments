import sys
import os
import django

# Ensure the backend directory is on the path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('SQLITE_DIR', '/tmp')

# Run migrations and seed on cold start
db_path = os.path.join('/tmp', 'db.sqlite3')
if not os.path.exists(db_path):
    try:
        django.setup()
        from django.core.management import call_command
        call_command('migrate', '--run-syncdb', verbosity=0)
        # Seed: create default admin and tournaments
        from accounts.models import User
        from tournaments.models import Tournament
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser('admin', 'admin@grimzone.pk', 'admin123')
            admin.role = 'admin'
            admin.tokens = 999999
            admin.save()
            player = User.objects.create_user('player1', 'player1@grimzone.pk', 'player123')
            player.tokens = 100
            player.save()
            tournaments_data = [
                {'title': 'Grand Battle Royale', 'type': 'squad', 'prize_pool': '2000 PKR', 'entry_fee': 25, 'total_slots': 50, 'slots_filled': 18},
                {'title': 'Squad Showdown', 'type': 'squad', 'prize_pool': '1000 PKR', 'entry_fee': 15, 'total_slots': 24, 'slots_filled': 12},
                {'title': 'Duo Rush', 'type': 'duo', 'prize_pool': '800 PKR', 'entry_fee': 10, 'total_slots': 20, 'slots_filled': 8},
                {'title': 'Solo Clash', 'type': 'solo', 'prize_pool': '500 PKR', 'entry_fee': 5, 'total_slots': 12, 'slots_filled': 5},
            ]
            for data in tournaments_data:
                Tournament.objects.create(**data)
    except Exception:
        pass

from django.core.wsgi import get_wsgi_application
app = get_wsgi_application()
