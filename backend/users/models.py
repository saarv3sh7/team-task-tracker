from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('MEMBER', 'Member'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')

    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.role})"