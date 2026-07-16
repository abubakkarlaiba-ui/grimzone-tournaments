from rest_framework import serializers
from .models import Tournament
from bookings.models import Booking

class TournamentSerializer(serializers.ModelSerializer):
    creator = serializers.PrimaryKeyRelatedField(read_only=True)
    creator_username = serializers.SerializerMethodField()
    prize_pool = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Tournament
        fields = '__all__'
        read_only_fields = ('room_id', 'room_password', 'creator')

    def get_creator_username(self, obj):
        if obj.creator:
            return obj.creator.username
        return None

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
