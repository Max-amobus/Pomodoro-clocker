from django.contrib import admin
from .models import PomodoroSession

@admin.register(PomodoroSession)
class PomodoroSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "duration", "is_completed", "completed_at")
