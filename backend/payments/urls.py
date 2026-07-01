from django.urls import path
from . import views

urlpatterns = [
    path('', views.PaymentCreate.as_view()),
    path('list/', views.PaymentList.as_view()),
]
