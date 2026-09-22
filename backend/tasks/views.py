
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task, Comment
from .serializers import TaskSerializer, CommentSerializer
from activities.utils import log_activity
from users.permissions import IsAdminRole


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        
        if self.action == 'destroy':
            return [IsAuthenticated(), IsAdminRole()]
        return super().get_permissions()

    def get_queryset(self):
        
        user_teams = self.request.user.teams.all()
        return Task.objects.filter(team__in=user_teams)

    def perform_create(self, serializer):
        task = serializer.save()
        log_activity(
            user=self.request.user,
            task=task,
            action="CREATED",
            message=f"created task '{task.title}'"
        )

    def perform_update(self, serializer):
        
        old_task = self.get_object()
        old_status = old_task.status
        old_assignee = old_task.assignee


        task = serializer.save()


        if old_status != task.status:
            log_activity(
                user=self.request.user,
                task=task,
                action="STATUS_CHANGED",
                message=f"moved '{task.title}' to {task.get_status_display()}"
            )


        if old_assignee != task.assignee:
            if task.assignee:
                log_activity(
                    user=self.request.user,
                    task=task,
                    action="ASSIGNED",
                    message=f"assigned '{task.title}' to {task.assignee.username}"
                )
            else:
                log_activity(
                    user=self.request.user,
                    task=task,
                    action="UNASSIGNED",
                    message=f"removed the assignee from '{task.title}'"
                )


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)

        snippet = (comment.text[:30] + '...') if len(comment.text) > 30 else comment.text
        log_activity(
            user=self.request.user,
            task=comment.task,
            action="COMMENTED",
            message=f"commented on '{comment.task.title}'"
        )