from django.contrib import admin
from .models import PomodoroSession

@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_type", "duration_minutes", "created_at")
