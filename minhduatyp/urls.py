from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # path('livereload/', livereload, name='livereload'),
    path('admin/', admin.site.urls),
    path('',include('collection.urls'))
]
