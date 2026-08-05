from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("save-session/", views.save_session, name="save_session"),
    path("session-history/", views.session_history, name="session_history"),
    path("summary/", views.session_summary, name="session_summary"),
    path("api/chart-data/", views.chart_data, name="chart_data"),
]