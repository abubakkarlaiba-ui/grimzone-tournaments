from django.urls import path
from . import views

urlpatterns = [
    path('', views.MyTeamsView.as_view(), name='my-teams'),
    path('create/', views.TeamCreateView.as_view(), name='team-create'),
    path('join/', views.TeamJoinView.as_view(), name='team-join'),
    path('<str:code>/', views.TeamDetailView.as_view(), name='team-detail'),
]
