from rest_framework import serializers
from .models import Tournament
from bookings.models import Booking

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ('room_id', 'room_password')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            is_admin = request.user.role in ('admin', 'owner')
            has_booking = Booking.objects.filter(
                user=request.user,
                tournament_title=instance.title
            ).exists()
            if not is_admin and not has_booking:
                data['room_id'] = ''
                data['room_password'] = ''
        else:
            data['room_id'] = ''
            data['room_password'] = ''
        return data
