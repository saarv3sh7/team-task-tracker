
from rest_framework import serializers
from .models import Team
from users.serializers import UserSerializer

class TeamSerializer(serializers.ModelSerializer):
    members_detail = UserSerializer(source='members', many=True, read_only=True)
    members = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ('id', 'name', 'description', 'members', 'members_detail', 'created_at')