import sys
import os
import traceback
import tempfile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
from django.conf import settings

database_url = os.environ.get('DATABASE_URL')
use_sqlite = not database_url

if use_sqlite:
    db_path = os.path.join(tempfile.gettempdir(), 'grimzone.sqlite3')
    settings.DATABASES['default']['ENGINE'] = 'django.db.backends.sqlite3'
    settings.DATABASES['default']['NAME'] = db_path
    settings.DATABASES['default']['OPTIONS'] = {'timeout': 20}
else:
    import dj_database_url
    pg_config = dj_database_url.config(default=database_url, conn_max_age=600)
    settings.DATABASES['default'].update(pg_config)

django.setup()

try:
    from django.core.management import call_command
    call_command('migrate', verbosity=0)
except Exception:
    traceback.print_exc()

try:
    from accounts.models import User
    from tournaments.models import Tournament
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@grimzone.pk', 'admin123')
        User.objects.create_user('player1', 'player1@grimzone.pk', 'player123')
        for data in [
            {'title':'Grand Battle Royale','type':'squad','prize_pool':'2000 PKR','entry_fee':25,'total_slots':12,'slots_filled':3},
            {'title':'Squad Showdown','type':'squad','prize_pool':'1000 PKR','entry_fee':15,'total_slots':12,'slots_filled':5},
            {'title':'Duo Rush','type':'duo','prize_pool':'800 PKR','entry_fee':10,'total_slots':25,'slots_filled':8},
            {'title':'Solo Clash','type':'solo','prize_pool':'500 PKR','entry_fee':5,'total_slots':50,'slots_filled':10},
        ]:
            Tournament.objects.create(**data)
except Exception:
    traceback.print_exc()

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
