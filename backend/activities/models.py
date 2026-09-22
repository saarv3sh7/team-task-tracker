from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    task_id = models.IntegerField()
    team_id = models.IntegerField(null=True)
    task_title = models.CharField(max_length=255)
    action = models.CharField(max_length=50)
    message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']