from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    task_id = models.IntegerField() # Store raw ID to avoid strict ForeignKey constraints in Mongo
    team_id = models.IntegerField(null=True) # Store raw team ID
    task_title = models.CharField(max_length=255)
    action = models.CharField(max_length=50) # 'CREATED', 'UPDATED', 'COMMENTED'
    message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']