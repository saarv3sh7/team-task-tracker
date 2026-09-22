from .models import Activity

def log_activity(user, task, action, message):
    Activity.objects.create(
        user=user,
        task_id=task.id,
        team_id=task.team.id,
        task_title=task.title,
        action=action,
        message=message
    )