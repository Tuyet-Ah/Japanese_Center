from django.db import models
from .Section import Section


class QuestionGroup(models.Model):
    GROUP_TYPE_CHOICES = (
        ('kanji', 'Kanji'),
        ('reading', 'Reading'),
        ('listening', 'Listening'),
        ('grammar', 'Grammar'),
        ('vocabulary', 'Vocabulary'),
        ('other', 'Other'),
    )

    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='question_groups')
    instruction = models.TextField()
    passage_text = models.TextField(blank=True, null=True)
    audio_url = models.CharField(max_length=500, blank=True, null=True)
    group_type = models.CharField(max_length=50, choices=GROUP_TYPE_CHOICES, default='other')
    order_index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order_index', 'id']
