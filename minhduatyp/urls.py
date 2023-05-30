from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

from minhduatyp import settings

urlpatterns = [
    # path('livereload/', livereload, name='livereload'),
    path('admin/', admin.site.urls),
    path('', include('collection.urls'))
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
