from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import LeaderboardEntry
from .serializers import LeaderboardTopScoresSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_scores_all_time(request):
    """Get top scores of all time"""
    limit = int(request.query_params.get('limit', 10))

    entries = LeaderboardEntry.objects.select_related('user').order_by(
        '-score', '-accuracy'
    )[:limit]

    results = []
    for rank, entry in enumerate(entries, 1):
        results.append({
            'rank': rank,
            'user_email': entry.user.email,
            'score': entry.score,
            'accuracy': entry.accuracy,
            'date': entry.date
        })

    return Response({
        'leaderboard_type': 'all-time',
        'entries': results
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_scores_this_week(request):
    """Get top scores this week"""
    limit = int(request.query_params.get('limit', 10))

    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())

    entries = LeaderboardEntry.objects.filter(
        date__gte=week_start
    ).select_related('user').order_by('-score', '-accuracy')[:limit]

    results = []
    for rank, entry in enumerate(entries, 1):
        results.append({
            'rank': rank,
            'user_email': entry.user.email,
            'score': entry.score,
            'accuracy': entry.accuracy,
            'date': entry.date
        })

    return Response({
        'leaderboard_type': 'weekly',
        'week_start': week_start,
        'week_end': today,
        'entries': results
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get current user's leaderboard stats"""
    user = request.user

    # All-time stats
    all_time_entries = LeaderboardEntry.objects.filter(user=user).order_by('-score', '-accuracy')
    all_time_best = all_time_entries.first()
    all_time_best_score = all_time_best.score if all_time_best else 0

    # All-time rank
    better_count = LeaderboardEntry.objects.filter(
        score__gt=all_time_best_score
    ).values('user').distinct().count()
    all_time_rank = better_count + 1 if all_time_entries.exists() else 0

    # Weekly stats
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())

    weekly_entries = LeaderboardEntry.objects.filter(
        user=user,
        date__gte=week_start
    ).order_by('-score', '-accuracy')
    weekly_best = weekly_entries.first()
    weekly_best_score = weekly_best.score if weekly_best else 0

    # Weekly rank
    better_weekly = LeaderboardEntry.objects.filter(
        date__gte=week_start,
        score__gt=weekly_best_score
    ).values('user').distinct().count()
    weekly_rank = better_weekly + 1 if weekly_entries.exists() else 0

    # Total players and entries
    total_players = LeaderboardEntry.objects.values('user').distinct().count()
    entries_count = all_time_entries.count()

    return Response({
        'all_time_best_score': all_time_best_score,
        'all_time_rank': all_time_rank,
        'weekly_best_score': weekly_best_score,
        'weekly_rank': weekly_rank,
        'total_players': total_players,
        'entries_count': entries_count
    }, status=status.HTTP_200_OK)
