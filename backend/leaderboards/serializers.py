from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import LeaderboardEntry
from games.serializers import GameRoundSerializer


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    """Serializer for LeaderboardEntry model"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    game_round_detail = GameRoundSerializer(source='game_round', read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'user', 'user_email', 'game_round', 'game_round_detail',
                  'score', 'accuracy', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Create a new leaderboard entry when game completes"""
        entry = LeaderboardEntry.objects.create(**validated_data)
        return entry


class LeaderboardTopScoresSerializer(serializers.Serializer):
    """Serializer for top scores leaderboard view"""
    rank = serializers.SerializerMethodField()
    user_email = serializers.CharField()
    score = serializers.IntegerField()
    accuracy = serializers.FloatField()
    date = serializers.DateField()

    def get_rank(self, obj):
        """This will be calculated in the view"""
        return getattr(obj, '_rank', None)


class LeaderboardUserStatsSerializer(serializers.Serializer):
    """Serializer for current user's leaderboard stats"""
    all_time_best_score = serializers.IntegerField()
    all_time_rank = serializers.IntegerField()
    weekly_best_score = serializers.IntegerField()
    weekly_rank = serializers.IntegerField()
    total_players = serializers.IntegerField()
    entries_count = serializers.IntegerField()
