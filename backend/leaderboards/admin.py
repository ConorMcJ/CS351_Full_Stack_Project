from django.contrib import admin
from django.utils import timezone
from .models import LeaderboardEntry


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    """Admin interface for Leaderboard Entries"""
    list_display = [
        'rank_display',
        'user',
        'score',
        'accuracy',
        'date',
        'game_round_link',
        'created_at'
    ]
    list_filter = ['date', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'rank_display', 'game_round_link']
    ordering = ['-score', '-accuracy']
    date_hierarchy = 'date'

    fieldsets = (
        ('Player', {
            'fields': ('user',)
        }),
        ('Performance', {
            'fields': ('score', 'accuracy', 'rank_display')
        }),
        ('Game Info', {
            'fields': ('game_round', 'game_round_link')
        }),
        ('Timestamps', {
            'fields': ('date', 'created_at'),
            'classes': ('collapse',)
        }),
    )

    def rank_display(self, obj):
        """Show the rank of this entry"""
        better_count = LeaderboardEntry.objects.filter(
            score__gt=obj.score
        ).count() + LeaderboardEntry.objects.filter(
            score=obj.score,
            accuracy__gt=obj.accuracy
        ).count()
        return f"#{better_count + 1}"
    rank_display.short_description = 'Rank'

    def game_round_link(self, obj):
        """Link to the game round in admin"""
        from django.urls import reverse
        from django.utils.html import format_html

        if obj.game_round:
            url = reverse('admin:games_gameround_change', args=[obj.game_round.id])
            return format_html('<a href="{}">View Game Round</a>', url)
        return "No game round"
    game_round_link.short_description = 'Game Round'

    actions = ['export_to_csv']

    def export_to_csv(self, request, queryset):
        """Export leaderboard entries to CSV"""
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="leaderboard.csv"'

        writer = csv.writer(response)
        writer.writerow(['Rank', 'User Email', 'Score', 'Accuracy', 'Date'])

        for idx, entry in enumerate(queryset.order_by('-score', '-accuracy'), 1):
            writer.writerow([idx, entry.user.email, entry.score, entry.accuracy, entry.date])

        return response
    export_to_csv.short_description = 'Export to CSV'

    def get_queryset(self, request):
        """Optimize queryset with select_related"""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'game_round')


# Custom admin views for leaderboard statistics
# Note: These features require model methods not yet implemented
# Uncomment and update when ready


# Customize admin site header and title
admin.site.site_header = "UIC Guesser Leaderboard Admin"
admin.site.site_title = "UIC Guesser Leaderboard Admin"
