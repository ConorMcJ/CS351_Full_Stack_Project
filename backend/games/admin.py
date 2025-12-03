from django.contrib import admin
from django.utils.html import format_html
from django import forms
import base64
from .models import UICEvent, GameRound, Guess


class UICEventAdminForm(forms.ModelForm):
    """Custom form for UICEvent that handles file uploads for binary storage"""
    image_upload = forms.FileField(
        required=False,
        help_text="Upload an image file (jpg, png, gif, webp). This will be stored as binary data in the database."
    )
    
    class Meta:
        model = UICEvent
        fields = ['name', 'organization', 'description', 'points_value', 'acceptable_answers', 'image_format']
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # Handle file upload - convert to binary
        uploaded_file = self.cleaned_data.get('image_upload')
        if uploaded_file:
            # Read file as binary
            instance.image_data = uploaded_file.read()
            
            # Auto-detect format from file extension
            filename = uploaded_file.name.lower()
            if filename.endswith('.png'):
                instance.image_format = 'png'
            elif filename.endswith('.gif'):
                instance.image_format = 'gif'
            elif filename.endswith('.webp'):
                instance.image_format = 'webp'
            else:
                instance.image_format = 'jpg'
        
        if commit:
            instance.save()
        return instance


@admin.register(UICEvent)
class UICEventAdmin(admin.ModelAdmin):
    """Admin interface for UIC Events"""
    form = UICEventAdminForm
    
    list_display = [
        'name', 
        'organization', 
        'points_value', 
        'image_preview',
        'event_date'
    ]
    list_filter = ['organization', 'event_date', 'image_format']
    search_fields = ['name', 'description', 'organization']
    ordering = ['name']
    readonly_fields = ['event_date', 'image_preview', 'image_size']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'organization', 'description')
        }),
        ('Game Settings', {
            'fields': ('points_value', 'acceptable_answers')
        }),
        ('Media', {
            'fields': ('image_upload', 'image_format', 'image_preview', 'image_size'),
            'description': 'Upload a new image or view the existing one. Images are stored as binary data in the database.'
        }),
        ('Metadata', {
            'fields': ('event_date',),
            'classes': ('collapse',)
        }),
    )

    def image_preview(self, obj):
        """Show image preview in admin from binary data"""
        if obj.image_data:
            # Convert binary data to base64 data URL
            encoded = base64.b64encode(obj.image_data).decode('utf-8')
            data_url = f"data:image/{obj.image_format};base64,{encoded}"
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px;" />',
                data_url
            )
        return "No image"
    image_preview.short_description = 'Image Preview'
    
    def image_size(self, obj):
        """Show image size in KB"""
        if obj.image_data:
            size_kb = len(obj.image_data) / 1024
            return f"{size_kb:.1f} KB"
        return "No image"
    image_size.short_description = 'Image Size'


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
