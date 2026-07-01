from django.urls import path
from . import views

urlpatterns = [
    path('', views.TournamentList.as_view()),
    path('<int:pk>/', views.TournamentDetail.as_view()),
]
