from django.urls import path
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name='timer/index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register'),
    path('history/', TemplateView.as_view(template_name='session_history.html'), name='session_history'),
    path('settings/', TemplateView.as_view(template_name='settings.html'), name='settings'),
]
