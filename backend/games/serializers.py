from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UICEvent, GameRound, Guess


class UICEventSerializer(serializers.ModelSerializer):
    """Serializer for UICEvent model (read-only, no frontend writes)"""

    class Meta:
        model = UICEvent
        fields = ['id', 'name', 'description', 'organization', 'image', 
                  'acceptable_answers', 'points_value', 'event_date']
        read_only_fields = fields  # All fields are read-only


class GuessSerializer(serializers.ModelSerializer):
    """Serializer for Guess model"""
    uic_event_detail = UICEventSerializer(source='uic_event', read_only=True)

    class Meta:
        model = Guess
        fields = ['id', 'game_round', 'uic_event', 'uic_event_detail', 
                  'user_answer', 'is_correct', 'time_taken', 'points_earned', 'created_at']
        read_only_fields = ['id', 'is_correct', 'points_earned', 'created_at']

    def create(self, validated_data):
        """Create a new guess with validation"""
        guess = Guess.objects.create(**validated_data)

        # Validate answer against acceptable answers
        uic_event = guess.uic_event
        user_answer_lower = guess.user_answer.lower().strip()
        acceptable_answers_lower = [ans.lower().strip() for ans in uic_event.acceptable_answers]

        guess.is_correct = user_answer_lower in acceptable_answers_lower
        guess.points_earned = uic_event.points_value if guess.is_correct else 0
        guess.save()

        return guess


class GameRoundSerializer(serializers.ModelSerializer):
    """Serializer for GameRound model"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    guesses = GuessSerializer(read_only=True, many=True)
    accuracy = serializers.SerializerMethodField()

    class Meta:
        model = GameRound
        fields = ['id', 'user', 'user_email', 'total_score', 'questions_answered',
                  'correct_answers', 'accuracy', 'is_completed', 'started_at', 
                  'completed_at', 'guesses']
        read_only_fields = ['user', 'user_email', 'total_score', 'accuracy', 'started_at']

    def get_accuracy(self, obj):
        """Calculate and return accuracy percentage"""
        if obj.questions_answered == 0:
            return 0
        return round((obj.correct_answers / obj.questions_answered) * 100, 2)

    def update(self, instance, validated_data):
        """Update game round (typically just completion)"""
        instance.questions_answered = validated_data.get('questions_answered', instance.questions_answered)
        instance.correct_answers = validated_data.get('correct_answers', instance.correct_answers)
        instance.total_score = validated_data.get('total_score', instance.total_score)
        instance.is_completed = validated_data.get('is_completed', instance.is_completed)
        if instance.is_completed:
            instance.completed_at = validated_data.get('completed_at', instance.completed_at)
        instance.save()
        return instance
