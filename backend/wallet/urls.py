from django.urls import path
from . import views

urlpatterns = [
    path('', views.WalletView.as_view()),
    path('transfer/', views.TransferTokensView.as_view()),
]
