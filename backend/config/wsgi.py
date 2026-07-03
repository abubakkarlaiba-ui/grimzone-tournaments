import sys
import os
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
from django.conf import settings

database_url = os.environ.get('DATABASE_URL')
use_sqlite = not database_url

if use_sqlite:
    os.environ.setdefault('SQLITE_DIR', '/tmp')
    db_path = '/tmp/grimzone.sqlite3'
    settings.DATABASES['default'] = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': db_path,
        'OPTIONS': {'timeout': 20},
    }
else:
    import dj_database_url
    settings.DATABASES['default'] = dj_database_url.config(default=database_url, conn_max_age=600)

django.setup()

should_seed = False

if use_sqlite:
    if not os.path.exists(db_path):
        should_seed = True
else:
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM pg_tables WHERE tablename = 'accounts_user'")
            table_exists = cursor.fetchone()[0] > 0
            if not table_exists:
                should_seed = True
    except Exception:
        should_seed = True

if should_seed:
    try:
        from django.core.management import call_command
        call_command('migrate', '--run-syncdb', verbosity=0)
        if use_sqlite:
            os.chmod(db_path, 0o666)
        from accounts.models import User
        from tournaments.models import Tournament
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@grimzone.pk', 'admin123')
            User.objects.create_user('player1', 'player1@grimzone.pk', 'player123')
            for data in [
                {'title':'Grand Battle Royale','type':'squad','prize_pool':'2000 PKR','entry_fee':25,'total_slots':50,'slots_filled':18},
                {'title':'Squad Showdown','type':'squad','prize_pool':'1000 PKR','entry_fee':15,'total_slots':24,'slots_filled':12},
                {'title':'Duo Rush','type':'duo','prize_pool':'800 PKR','entry_fee':10,'total_slots':20,'slots_filled':8},
                {'title':'Solo Clash','type':'solo','prize_pool':'500 PKR','entry_fee':5,'total_slots':12,'slots_filled':5},
            ]:
                Tournament.objects.create(**data)
    except Exception:
        traceback.print_exc()

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
