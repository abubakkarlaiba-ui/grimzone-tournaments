from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.AdminStatsView.as_view()),
    path('payments/', views.AdminPaymentListView.as_view()),
    path('payments/<int:pk>/verify/', views.AdminPaymentVerifyView.as_view()),
    path('users/', views.AdminUserListView.as_view()),
    path('tokens/', views.AdminAddTokensView.as_view()),
    path('bookings/', views.AdminBookingListView.as_view()),
    path('set-room/', views.AdminRoomSetView.as_view()),
    path('update-slots/', views.UpdateTournamentSlotsView.as_view()),
]
