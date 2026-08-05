from django.db import models
from django.contrib.auth.models import User

class UserSettings(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
    )

    pomodoro_time = models.PositiveIntegerField(default=25)
    short_break = models.PositiveIntegerField(default=5)
    long_break = models.PositiveIntegerField(default=15)

    def __str__(self):
        return self.user.username