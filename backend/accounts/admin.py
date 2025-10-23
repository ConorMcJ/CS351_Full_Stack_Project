from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    """Inline admin for UserProfile to show on User admin page"""
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('total_score', 'games_played', 'best_score', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')


class UserAdmin(BaseUserAdmin):
    """Extended User admin with profile inline"""
    inlines = (UserProfileInline,)
    list_display = ['email', 'date_joined', 'is_staff', 'get_games_played', 'get_best_score']
    list_filter = ['is_staff', 'is_active', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    def get_games_played(self, obj):
        return obj.profile.games_played if hasattr(obj, 'profile') else 0
    get_games_played.short_description = 'Games Played'
    get_games_played.admin_order_field = 'profile__games_played'
    
    def get_best_score(self, obj):
        return obj.profile.best_score if hasattr(obj, 'profile') else 0
    get_best_score.short_description = 'Best Score'
    get_best_score.admin_order_field = 'profile__best_score'


# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Direct admin for UserProfile (optional, since it's also inline)"""
    list_display = ['user', 'total_score', 'games_played', 'best_score', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-best_score']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Statistics', {
            'fields': ('total_score', 'games_played', 'best_score')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
