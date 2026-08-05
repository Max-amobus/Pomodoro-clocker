from django.shortcuts import render
from django.http import JsonResponse
from .models import PomodoroSession
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.db.models.functions import TruncDate

def home(request):
    return render(request, "base.html")

@require_POST
def save_session(request):

    duration = int(request.POST.get("duration", 25))
    session_type = request.POST.get("session_type", "pomodoro")

    print(session_type)

    PomodoroSession.objects.create(
        user=request.user if request.user.is_authenticated else None,
        duration_minutes=duration,
        session_type=session_type
    )

    return JsonResponse({
        "status": "saved"
    })

@login_required
def session_history(request):

    sessions = PomodoroSession.objects.filter(
        user=request.user
    ).order_by("-created_at")

    context = {
        "sessions": sessions,
    }

    return render(request, "session_history.html", context)

def session_summary(request):

    total_minutes = (
        PomodoroSession.objects.filter(
            user=request.user
        ).aggregate(
            Sum("duration_minutes")
        )["duration_minutes__sum"]
    )

    if total_minutes is None:
        total_minutes = 0

    context = {
        "total_minutes": total_minutes,
    }

    return render(request, "session_summary.html", context)

@login_required
def chart_data(request):

    data = (
        PomodoroSession.objects.filter(
            user=request.user,
            session_type="pomodoro"
        )
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(total_minutes=Sum("duration_minutes"))
        .order_by("day")
    )

    return JsonResponse(list(data), safe=False)