from django.urls import path
from . import views

urlpatterns = [
    path('', views.ChatMessageListCreate.as_view()),
]
