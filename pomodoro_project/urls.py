from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('', include('timer.urls')),         # Таймер буде на головній сторінці
    path('analytics/', include('analytics.urls')),
]