from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Team
from .serializers import TeamSerializer
from users.permissions import IsAdminRole

User = get_user_model()


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Admins see all teams; Members see only teams they are part of
        if self.request.user.is_admin():
            return Team.objects.all()
        return Team.objects.filter(members=self.request.user)

    def get_permissions(self):
        # Only admins can Create, Update, Delete teams and invite members
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'invite']:
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def perform_create(self, serializer):
        # Save the team, then automatically add the creator as a member
        team = serializer.save()
        team.members.add(self.request.user)


    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_to_add = User.objects.get(id=user_id)
            team.members.add(user_to_add)

            # Simulate email invitation in terminal
            inviter = request.user
            inviter_email = (
                inviter.email
                if inviter.email
                else f"{inviter.username}@xyz.com"
            )
            invitee_email = (
                user_to_add.email
                if user_to_add.email
                else f"{user_to_add.username}@xyz.com"
            )

            print("\n" + "=" * 50)
            print("📧 EMAIL INVITATION")
            print("=" * 50)
            print(f"From: {inviter.username} <{inviter_email}>")
            print(f"To: {user_to_add.username} <{invitee_email}>")
            print(f"Subject: Invitation to join {team.name}")
            print("-" * 50)
            print(f"Hello {user_to_add.username},")
            print(
                f"{inviter.username} has invited you to join "
                f"the team '{team.name}'."
            )
            print("Please log in to your Team Task Tracker dashboard.")
            print("\nRegards,")
            print("Team Task Tracker")
            print("=" * 50 + "\n")

            return Response(
                self.get_serializer(team).data,
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )