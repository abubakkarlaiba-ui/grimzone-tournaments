from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.db import connection
import os
import stat

def debug(request):
    db_path = '/tmp/grimzone.sqlite3'
    lines = []
    lines.append(f"DB_PATH: {db_path}")
    lines.append(f"DB_EXISTS: {os.path.exists(db_path)}")
    if os.path.exists(db_path):
        st = os.stat(db_path)
        lines.append(f"DB_PERMS: {oct(stat.S_IMODE(st.st_mode))}")
        lines.append(f"DB_SIZE: {st.st_size}")
    lines.append(f"TMP_WRITABLE: {os.access('/tmp', os.W_OK)}")
    return HttpResponse('\n'.join(lines), content_type='text/plain')

def debug_write(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("CREATE TABLE IF NOT EXISTS _debug_test (id INTEGER PRIMARY KEY)")
            cursor.execute("INSERT INTO _debug_test VALUES (1)")
            return HttpResponse("WRITE_OK")
    except Exception as e:
        return HttpResponse(f"WRITE_FAIL: {e}", status=500)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/tournaments/', include('tournaments.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/admin/', include('admin_dashboard.urls')),
    path('debug/', debug),
    path('debug-write/', debug_write),
]
