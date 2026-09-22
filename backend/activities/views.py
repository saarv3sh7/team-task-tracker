from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Activity
from .serializers import ActivitySerializer


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        team_id = self.request.query_params.get('team_id')

        if team_id:
            return Activity.objects.filter(team_id=team_id)[:50]

        
        return Activity.objects.all()[:50]