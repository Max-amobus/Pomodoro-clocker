from django.db import models
from django.contrib.auth.models import User

class PomodoroSession(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    duration = models.PositiveIntegerField()
    is_completed = models.BooleanField(default=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.duration} minutes"
