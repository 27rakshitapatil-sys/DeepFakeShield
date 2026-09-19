from django.urls import path

from .views import analyze_image_api, analyze_video_api


urlpatterns = [
    path("analyze/", analyze_image_api, name="analyze_image"),
    path("analyze-video/", analyze_video_api, name="analyze_video"),
]