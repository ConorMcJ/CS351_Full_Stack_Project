from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import random
from .models import UICEvent, GameRound, Guess
from .serializers import UICEventSerializer, GameRoundSerializer, GuessSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_uic_events(request):
    """Get all UIC events (read-only)"""
    events = UICEvent.objects.all()
    serializer = UICEventSerializer(events, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_game(request):
    """Start a new game round"""
    # Create a new game round for the user
    game_round = GameRound.objects.create(user=request.user)

    # Get random UIC events for this round (e.g., 7 questions)
    events = UICEvent.objects.all()
    if events.count() < 7:
        # If fewer than 7 events exist, use all available
        selected_events = list(events)
    else:
        selected_events = random.sample(list(events), 7)

    serializer = GameRoundSerializer(game_round)
    events_serializer = UICEventSerializer(selected_events, many=True)

    return Response({
        'game_round_id': game_round.id,
        'questions': events_serializer.data,
        'total_questions': len(selected_events)
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_guess(request):
    """Submit a guess for a question"""
    game_round_id = request.data.get('game_round_id')
    uic_event_id = request.data.get('uic_event_id')
    user_answer = request.data.get('answer')
    time_taken = request.data.get('time_taken', 0)

    try:
        game_round = GameRound.objects.get(id=game_round_id, user=request.user)
        uic_event = UICEvent.objects.get(id=uic_event_id)
    except (GameRound.DoesNotExist, UICEvent.DoesNotExist):
        return Response(
            {'error': 'Game round or event not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Create guess (will be validated in serializer)
    guess = Guess.objects.create(
        game_round=game_round,
        uic_event=uic_event,
        user_answer=user_answer,
        time_taken=time_taken
    )

    # Validate answer
    user_answer_lower = user_answer.lower().strip()
    acceptable_answers_lower = [ans.lower().strip() for ans in uic_event.acceptable_answers]
    is_correct = user_answer_lower in acceptable_answers_lower
    points_earned = uic_event.points_value if is_correct else 0

    guess.is_correct = is_correct
    guess.points_earned = points_earned
    guess.save()

    # Update game round stats
    game_round.questions_answered += 1
    if is_correct:
        game_round.correct_answers += 1
    game_round.total_score += points_earned
    game_round.save()

    return Response({
        'is_correct': is_correct,
        'points_earned': points_earned,
        'correct_answer': uic_event.name,
        'description': uic_event.description,
        'acceptable_answers': uic_event.acceptable_answers,
        'current_score': game_round.total_score,
        'questions_remaining': max(0, 7 - game_round.questions_answered)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_game(request):
    """Complete a game round"""
    game_round_id = request.data.get('game_round_id')

    try:
        game_round = GameRound.objects.get(id=game_round_id, user=request.user)
    except GameRound.DoesNotExist:
        return Response(
            {'error': 'Game round not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Mark as completed
    game_round.is_completed = True
    game_round.completed_at = timezone.now()
    game_round.save()

    # Update user profile
    profile = request.user.profile
    profile.games_played += 1
    profile.total_score += game_round.total_score
    if game_round.total_score > profile.best_score:
        profile.best_score = game_round.total_score
    profile.save()

    # Create leaderboard entry
    from leaderboards.models import LeaderboardEntry
    LeaderboardEntry.objects.create(
        user=request.user,
        game_round=game_round,
        score=game_round.total_score,
        accuracy=game_round.accuracy,
        date=timezone.now().date()
    )

    accuracy = game_round.accuracy if game_round.questions_answered > 0 else 0

    return Response({
        'final_score': game_round.total_score,
        'questions_answered': game_round.questions_answered,
        'correct_answers': game_round.correct_answers,
        'accuracy': accuracy,
        'is_personal_best': game_round.total_score == profile.best_score
    }, status=status.HTTP_200_OK)
