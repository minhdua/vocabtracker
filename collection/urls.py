from django.urls import path
from . import views

urlpatterns = [
    path('success/', views.success_view, name='success'),
    path('', views.topic_list, name='topic_list'),
    path('<int:topic_id>/', views.vocab_list, name='vocab_list'),
    path('add/', views.add_topic, name='add_topic'),
    path('study/', views.study, name='study_topic'),
    path('study/handle_typing/', views.handle_typing,  name='handle_typing'),
    path('review/<int:topic_id>/', views.review, name='review'),
    path('review/handle_review/', views.handle_review, name='handle_review')
]
