from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, UserSettings


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    pass


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "pomodoro_time",
        "short_break",
        "long_break",
    )