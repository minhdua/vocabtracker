
from django.db import models
from django.contrib.postgres.fields import ArrayField
from .enums import PARTS_OF_SPEECH_CHOICES, TEST_MODE_CHOICES


class Topic(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    index = models.IntegerField(default=0)
    image_url = models.ImageField(
        blank=True, null=True, upload_to='topic_images/')


class Vocabulary(models.Model):
    word = models.CharField(max_length=255)
    pronunciation = models.CharField(max_length=255)
    meaning = models.CharField(max_length=255)
    parts_of_speech = models.CharField(
        max_length=20, choices=PARTS_OF_SPEECH_CHOICES, default=None, null=True)
    attempts_correct = models.BigIntegerField(default=0)
    attempts_incorrect = ArrayField(models.CharField(
        max_length=255), default=list, blank=True, null=True)
    attempts_total = models.BigIntegerField(default=0)
    checks_correct = models.BigIntegerField(default=0)
    checks_incorrect = ArrayField(models.CharField(
        max_length=255), default=list, blank=True, null=True)
    checks_total = models.BigIntegerField(default=0)
    note = models.TextField(blank=True, null=True)
    examples = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)
    synonyms = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)
    antonyms = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)
    image_url = models.CharField(max_length=2000, null=True, blank=True)
    topic = models.ForeignKey(
        Topic, on_delete=models.CASCADE, related_name='vocabulary')
    flag = models.BooleanField(default=True)
    uncheck_ifnull = models.BooleanField(default=False)

    # study_time =


class Question(models.Model):
    test_mode = models.CharField(
        max_length=20, choices=TEST_MODE_CHOICES, default="meaning")
    word = models.ForeignKey(
        Vocabulary, on_delete=models.CASCADE, related_name='questions')
    distractor_1 = models.CharField(max_length=255, null=True)
    distractor_2 = models.CharField(max_length=255, null=True)
    distractor_3 = models.CharField(max_length=255, null=True)
    distractor_4 = models.CharField(max_length=255, null=True)
    answer = models.CharField(max_length=255)


class Test(models.Model):
    questions = models.ForeignKey(
        Question, related_name='tests', on_delete=models.CASCADE)
