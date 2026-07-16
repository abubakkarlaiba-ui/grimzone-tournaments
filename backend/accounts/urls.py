from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('me/', views.MeView.as_view(), name='me'),
    path('stats/', views.UserStatsView.as_view(), name='stats'),
    path('site-stats/', views.SiteStatsView.as_view(), name='site-stats'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
]
