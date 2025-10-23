from django.urls import path
from . import views

urlpatterns = [
    path('top/', views.top_scores_all_time, name='top_scores'),
    path('weekly/', views.top_scores_this_week, name='top_weekly'),
    path('me/', views.user_stats, name='user_stats'),
]

