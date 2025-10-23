from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (read-only fields from auth.User)"""

    class Meta:
        model = User
        fields = ['id', 'email', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'total_score', 'games_played', 'best_score', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def update(self, instance, validated_data):
        """Update user profile stats"""
        instance.total_score = validated_data.get('total_score', instance.total_score)
        instance.games_played = validated_data.get('games_played', instance.games_played)
        instance.best_score = validated_data.get('best_score', instance.best_score)
        instance.save()
        return instance


class UserDetailSerializer(serializers.Serializer):
    """Serializer for user registration and profile details"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    profile = UserProfileSerializer(read_only=True)

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['email']  # Use email as username
        )
        UserProfile.objects.create(user=user)
        return user
