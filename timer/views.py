from django.shortcuts import render
from django.http import JsonResponse
from .models import PomodoroSession
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.db.models.functions import TruncDate
from users.models import UserSettings

# Декоратор @login_required прибрано
def home(request):
    if request.user.is_authenticated:
        # Логіка для авторизованих користувачів
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        sessions = PomodoroSession.objects.filter(user=request.user)

        total_minutes = sessions.filter(session_type__iexact="pomodoro").aggregate(Sum("duration_minutes"))[
                            "duration_minutes__sum"] or 0
        hours, minutes = divmod(total_minutes, 60)
        total_time_str = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"

        completed_sessions = sessions.filter(session_type__iexact="pomodoro").count()
        active_days = sessions.dates('created_at', 'day').count()
        recent_sessions = sessions.order_by("-created_at")[:4]

        pomodoro_sec = settings.pomodoro_time * 60
        short_break_sec = settings.short_break * 60
        long_break_sec = settings.long_break * 60
    else:
        # Логіка для гостей (стандартні значення)
        total_time_str = "0m"
        completed_sessions = 0
        active_days = 0
        recent_sessions = []

        pomodoro_sec = 25 * 60
        short_break_sec = 5 * 60
        long_break_sec = 15 * 60

    context = {
        "total_time": total_time_str,
        "session_count": completed_sessions,
        "active_days": active_days,
        "recent_sessions": recent_sessions,
        "pomodoro_sec": pomodoro_sec,
        "short_break_sec": short_break_sec,
        "long_break_sec": long_break_sec,

        "auto_start": settings.auto_start if request.user.is_authenticated else False,
        "sound_enabled": settings.sound_enabled if request.user.is_authenticated else True,
    }

    return render(request, "timer/index.html", context)


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

@login_required
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