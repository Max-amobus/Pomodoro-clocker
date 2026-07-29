from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('', include('timer.urls')),
    path('analytics/', include('analytics.urls')),

    path('service-worker.js', TemplateView.as_view(template_name='service-worker.js', content_type='application/javascript')),

]