from django.db import models


# Information about UIC events
class UICEvent(models.Model):
    IMAGE_FORMAT_CHOICES = [
        ('jpg', 'JPEG'),
        ('jpeg', 'JPEG'),
        ('png', 'PNG'),
        ('gif', 'GIF'),
        ('webp', 'WebP'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    organization = models.CharField(max_length=100)
    image_data = models.BinaryField(null=True, blank=True, help_text="Binary image data stored in database")
    image_format = models.CharField(
        max_length=10, 
        default='jpg',
        choices=IMAGE_FORMAT_CHOICES,
        help_text="Image file format (jpg, png, gif, webp)"
    )
    acceptable_answers = models.JSONField(default=list)
    points_value = models.IntegerField(default=100)
    event_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


# A single game session
class GameRound(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='game_rounds')
    total_score = models.IntegerField(default=0)
    questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Round {self.id} - {self.user.email}"

    @property
    def accuracy(self):
        if self.questions_answered == 0:
            return 0
        return (self.correct_answers / self.questions_answered) * 100

    class Meta:
        ordering = ['-started_at']


# Individual guesses within a game round
class Guess(models.Model):
    game_round = models.ForeignKey(GameRound, on_delete=models.CASCADE, related_name='guesses')
    uic_event = models.ForeignKey(UICEvent, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=200)
    is_correct = models.BooleanField(default=False)
    time_taken = models.FloatField(help_text="Time in seconds")
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Guess: {self.user_answer} ({'Correct' if self.is_correct else 'Incorrect'})"

    class Meta:
        ordering = ['created_at']
        verbose_name_plural = "Guesses"

