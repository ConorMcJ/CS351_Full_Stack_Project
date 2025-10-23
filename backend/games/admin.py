from django.contrib import admin
from django.utils.html import format_html
from .models import UICEvent, GameRound, Guess


@admin.register(UICEvent)
class UICEventAdmin(admin.ModelAdmin):
    """Admin interface for UIC Events"""
    list_display = [
        'name', 
        'organization', 
        'points_value', 
        'image_preview',
        'event_date'
    ]
    list_filter = ['organization', 'event_date']
    search_fields = ['name', 'description', 'organization']
    ordering = ['name']
    readonly_fields = ['event_date', 'image_preview']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'organization', 'description')
        }),
        ('Game Settings', {
            'fields': ('points_value', 'acceptable_answers')
        }),
        ('Media', {
            'fields': ('image', 'image_preview')
        }),
        ('Metadata', {
            'fields': ('event_date',),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        """Show image preview in admin"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = 'Image Preview'


class GuessInline(admin.TabularInline):
    """Inline admin for Guesses within GameRound"""
    model = Guess
    extra = 0
    readonly_fields = ['uic_event', 'user_answer', 'is_correct', 'time_taken', 'points_earned', 'created_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(GameRound)
class GameRoundAdmin(admin.ModelAdmin):
    """Admin interface for Game Rounds"""
    list_display = [
        'id',
        'user',
        'total_score',
        'correct_answers',
        'questions_answered',
        'accuracy_display',
        'is_completed',
        'started_at'
    ]
    list_filter = ['is_completed', 'started_at']
    search_fields = ['user__email']
    readonly_fields = ['started_at', 'completed_at', 'accuracy_display']
    ordering = ['-started_at']
    inlines = [GuessInline]

    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Score & Progress', {
            'fields': ('total_score', 'questions_answered', 'correct_answers', 'accuracy_display')
        }),
        ('Status', {
            'fields': ('is_completed', 'started_at', 'completed_at')
        }),
    )

    def accuracy_display(self, obj):
        """Display accuracy as percentage"""
        return f"{obj.accuracy:.1f}%"
    accuracy_display.short_description = 'Accuracy'


@admin.register(Guess)
class GuessAdmin(admin.ModelAdmin):
    """Admin interface for individual Guesses"""
    list_display = [
        'id',
        'game_round',
        'uic_event',
        'user_answer',
        'is_correct',
        'time_taken',
        'points_earned',
        'created_at'
    ]
    list_filter = ['is_correct', 'created_at']
    search_fields = ['user_answer', 'uic_event__name', 'game_round__user__email']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    fieldsets = (
        ('Game Info', {
            'fields': ('game_round', 'uic_event')
        }),
        ('Answer', {
            'fields': ('user_answer', 'is_correct')
        }),
        ('Performance', {
            'fields': ('time_taken', 'points_earned')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


# Customize admin site header and title
admin.site.site_header = "UIC Guesser Admin"
admin.site.site_title = "UIC Guesser Admin Portal"
admin.site.index_title = "Welcome to UIC Guesser Administration"
