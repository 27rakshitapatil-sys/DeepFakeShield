from django.urls import path

from .views import analyze_image_api, analyze_video_api
from .auth_views import (
    register_api,
    login_api,
    logout_api,
    current_user_api,
)


urlpatterns = [
    # Existing detection APIs
    path(
        "analyze/",
        analyze_image_api,
        name="analyze_image",
    ),

    path(
        "analyze-video/",
        analyze_video_api,
        name="analyze_video",
    ),

    # Authentication APIs
    path(
        "auth/register/",
        register_api,
        name="register",
    ),

    path(
        "auth/login/",
        login_api,
        name="login",
    ),

    path(
        "auth/logout/",
        logout_api,
        name="logout",
    ),

    path(
        "auth/me/",
        current_user_api,
        name="current_user",
    ),
]