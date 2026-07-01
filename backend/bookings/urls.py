from django.urls import path
from . import views

urlpatterns = [
    path('', views.BookingListCreate.as_view()),
]
