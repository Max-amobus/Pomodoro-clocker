from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    pass


class UserSettings(models.Model):

    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
    )

    pomodoro_time = models.PositiveIntegerField(default=25)
    short_break = models.PositiveIntegerField(default=5)
    long_break = models.PositiveIntegerField(default=15)

    class Meta:
        verbose_name = "User Settings"
        verbose_name_plural = "user settings"

    def __str__(self):
        return self.user.username