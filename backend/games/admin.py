from django.contrib import admin
from .models import UICEvent, GameRound, Guess

@admin.register(UICEvent)
class UICEventAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'points_value']
    list_filter = ['organization']
    search_fields = ['name', 'description']

@admin.register(GameRound)
class GameRoundAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_score', 'correct_answers', 'questions_answered', 'started_at']
    list_filter = ['is_completed', 'started_at']
    readonly_fields = ['started_at']

@admin.register(Guess)
class GuessAdmin(admin.ModelAdmin):
    list_display = ['game_round', 'uic_event', 'user_answer', 'is_correct', 'points_earned']
    list_filter = ['is_correct', 'created_at']
