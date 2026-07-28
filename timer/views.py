from django.shortcuts import render
from django.http import JsonResponse
from .models import PomodoroSession
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.db.models import Sum

def home(request):
    return render(request, "base.html")

@require_POST
def save_session(request):

    duration = int(request.POST.get("duration", 25))

    PomodoroSession.objects.create(
        user=request.user if request.user.is_authenticated else None,
        duration=duration,
    )

    return JsonResponse({
        "status": "saved"
    })

@login_required
def session_history(request):

    sessions = PomodoroSession.objects.filter(
        user=request.user
    ).order_by("-completed_at")

    context = {
        "sessions": sessions,
    }

    return render(request, "session_history.html", context)

def session_summary(request):

    total_minutes = (
        PomodoroSession.objects.filter(
            user=request.user
        ).aggregate(
            Sum("duration")
        )["duration__sum"]
    )

    if total_minutes is None:
        total_minutes = 0

    context = {
        "total_minutes": total_minutes,
    }

    return render(request, "session_summary.html", context)