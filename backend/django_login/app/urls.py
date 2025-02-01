from django.urls import include
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import (
    register,
    verifyEmail,
    login,
    google_signIn,
    edit_profile,
    # upload_image,
    get_profile
)

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('register/', register, name='register'),
    path('verify-email/<str:token>/', verifyEmail, name='verify-email'),
    path('login/', login, name='login'),
    path('google-signin/', google_signIn, name='google-signin'),
    path('edit-profile/', edit_profile, name='edit-profile'),
    path('get-profile/', get_profile, name='get-profile'),
    # path('upload-image/', upload_image, name='upload-image'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
