from django.urls import path
from . import views

urlpatterns = [
    path('events/', views.get_uic_events, name='get_events'),
    path('start/', views.start_game, name='start_game'),
    path('guess/', views.submit_guess, name='submit_guess'),
    path('complete/', views.complete_game, name='complete_game'),
]

