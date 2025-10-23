from django.db import models
from django.utils import timezone

# High scores for the leaderboard
class LeaderboardEntry(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='leaderboard_entries')
    game_round = models.OneToOneField('games.GameRound', on_delete=models.CASCADE)
    score = models.IntegerField()
    accuracy = models.FloatField()
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.score} pts"

    class Meta:
        ordering = ['-score', '-accuracy']
        verbose_name_plural = "Leaderboard Entries"
        indexes = [
            models.Index(fields=['-score']),
            models.Index(fields=['date']),
        ]

