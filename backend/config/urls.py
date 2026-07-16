from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'GrimZone API',
        'endpoints': {
            'auth': '/api/auth/',
            'tournaments': '/api/tournaments/',
            'bookings': '/api/bookings/',
            'teams': '/api/teams/',
            'chat': '/api/chat/',
            'wallet': '/api/wallet/',
            'payments': '/api/payments/',
            'admin': '/api/admin/',
        }
    })

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/tournaments/', include('tournaments.urls')),
    path('api/wallet/', include('wallet.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/admin/', include('admin_dashboard.urls')),
    path('api/teams/', include('teams.urls')),
    path('api/chat/', include('chat.urls')),
]
