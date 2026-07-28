from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum, Avg
from timer.models import PomodoroSession
from django.db.models.functions import TruncDate
from django.http import JsonResponse

@login_required
def dashboard(request):

    sessions = PomodoroSession.objects.filter(
        user=request.user,
    )

    total_sessions = sessions.count()

    total_minutes = (
        sessions.aggregate(
            Sum("duration")
        )["duration__sum"] or 0
    )

    average_duration = (
        sessions.aggregate(
            Avg("duration")
        )["duration__avg"] or 0
    )

    daily_statistics = (
        sessions
        .annotate(day=TruncDate("completed_at"))
        .values("day")
        .annotate(total_minutes=Sum("duration"))
        .order_by("day")
    )

    context = {
        "total_sessions": total_sessions,
        "total_minutes": total_minutes,
        "average_duration": round(average_duration, 1),
        "daily_statistics": daily_statistics,
    }

    return render(
        request,
        "analytics/dashboard.html",
        context,
    )

@login_required
def chart_data(request):

    sessions = (
        PomodoroSession.objects.filter(
            user=request.user
        )
        .annotate(day=TruncDate("completed_at"))
        .values("day")
        .annotate(total_minutes=Sum("duration"))
        .order_by("day")
    )

    data = []

    for session in sessions:

        data.append({
            "day": str(session["day"]),
            "minutes": session["total_minutes"],
        })

    return JsonResponse(data, safe=False)