import sys
import os
import stat as statlib

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
os.environ['SQLITE_DIR'] = '/tmp'

import django
from django.conf import settings

db_dir = '/tmp'
db_path = os.path.join(db_dir, 'grimzone.sqlite3')

# Remove any stale db files from previous cold starts
for f in os.listdir(db_dir):
    if f.startswith('grimzone.sqlite3'):
        try:
            os.remove(os.path.join(db_dir, f))
        except:
            pass

settings.DATABASES['default'] = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': db_path,
    'OPTIONS': {'timeout': 20},
}

django.setup()

if not os.path.exists(db_path):
    from django.core.management import call_command
    call_command('migrate', '--run-syncdb', verbosity=0)
    # Ensure DB file is writable
    os.chmod(db_path, statlib.S_IRUSR | statlib.S_IWUSR | statlib.S_IRGRP | statlib.S_IWGRP)
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
from django.http import HttpResponse

# Debug endpoint to check DB status
def debug_app(environ, start_response):
    if environ.get('PATH_INFO') == '/debug':
        status = '200 OK'
        headers = [('Content-Type', 'text/plain')]
        lines = []
        lines.append(f"DB_PATH: {db_path}")
        lines.append(f"DB_EXISTS: {os.path.exists(db_path)}")
        if os.path.exists(db_path):
            st = os.stat(db_path)
            lines.append(f"DB_PERMS: {oct(statlib.S_IMODE(st.st_mode))}")
            lines.append(f"DB_SIZE: {st.st_size}")
            lines.append(f"CWD: {os.getcwd()}")
            lines.append(f"TMP_WRITABLE: {os.access('/tmp', os.W_OK)}")
        lines.append(f"ENV SQLITE_DIR: {os.environ.get('SQLITE_DIR', 'NOT SET')}")
        start_response(status, headers)
        return [('\n'.join(lines)).encode()]
    
    # Try a test write
    if environ.get('PATH_INFO') == '/debug-write':
        from django.db import connection
        with connection.cursor() as cursor:
            try:
                cursor.execute("CREATE TABLE IF NOT EXISTS _debug_test (id INTEGER PRIMARY KEY)")
                cursor.execute("INSERT INTO _debug_test VALUES (1)")
                status = '200 OK'
                body = 'WRITE_OK'
            except Exception as e:
                status = '500 ERROR'
                body = f'WRITE_FAIL: {e}'
        headers = [('Content-Type', 'text/plain')]
        start_response(status, headers)
        return [body.encode()]
    
    return wsgi_app(environ, start_response)

wsgi_app = get_wsgi_application()
app = debug_app
