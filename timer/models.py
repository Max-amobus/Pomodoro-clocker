from django.db import models
from django.conf import settings

class PomodoroSession(models.Model):

    SESSION_TYPES = [
        ("pomodoro", "Pomodoro"),
        ("short", "Short Break"),
        ("long", "Long Break"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    session_type = models.CharField(
        max_length=20,
        choices=SESSION_TYPES,
        default="pomodoro",
    )

    duration_minutes = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.session_type}"
