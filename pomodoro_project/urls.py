from django.contrib import admin
from django.urls import path, include
from users import views as user_views
from django.views.generic import TemplateView
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),

    path('service-worker.js', TemplateView.as_view(
        template_name="service-worker.js",
        content_type='application/javascript'
    )),


    path("login/", user_views.login_view, name="login"),
    path("register/", user_views.register_view, name="register"),
    path("logout/", user_views.logout_view, name="logout"),
    path("settings/", user_views.settings_view, name="settings"),

    path("analytics/", include("analytics.urls")),
    path("", include("timer.urls")),
]