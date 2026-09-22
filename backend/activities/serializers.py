from rest_framework import serializers
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Activity
        fields = '__all__'