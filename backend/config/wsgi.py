import os
import sys

os.environ.setdefault('SQLITE_DIR', '/tmp')

import django
from django.conf import settings

db_path = '/tmp/grimzone.sqlite3'
settings.DATABASES['default'] = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': db_path,
    'OPTIONS': {'timeout': 20},
}

django.setup()

if not os.path.exists(db_path):
    from django.core.management import call_command
    call_command('migrate', '--run-syncdb', verbosity=0)
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

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
