from django.urls import path
from . import views

urlpatterns = [
    # path('',views.index, name='index'),
    # path('add/',views.add, name='add'),
    path('success/', views.success_view, name='success'),
    path('', views.topic_list, name='topic_list'),
    path('add/', views.add_topic, name='add_topic'),
]
