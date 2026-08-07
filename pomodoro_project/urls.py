from django.contrib import admin
from django.urls import path, include
from users import views as user_views

urlpatterns = [
    path("admin/", admin.site.urls),

    # Главная страница (таймер)
    path("", include("timer.urls")),

    # Аналитика
    path("analytics/", include("analytics.urls")),

    # Авторизация
    path("login/", user_views.login_view, name="login"),
    path("register/", user_views.register_view, name="register"),
    path("logout/", user_views.logout_view, name="logout"),

    # История
    path("history/", user_views.history_view, name="history"),

    # Настройки
    path("settings/", user_views.settings_view, name="settings"),
]