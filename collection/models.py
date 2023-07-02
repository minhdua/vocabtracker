
from .enums import PARTS_OF_SPEECH_CHOICES, TEST_MODE_CHOICES, LanguageEnum
from enumchoicefield import EnumChoiceField
from django.db import models
from django.contrib.postgres.fields import ArrayField
kanji_details = models.JSONField(blank=True, null=True)


class Topic(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    index = models.IntegerField(default=0)
    image_url = models.ImageField(
        blank=True, null=True, upload_to='topic_images/')
    language = EnumChoiceField(LanguageEnum, default=LanguageEnum.ENGLISH)


class Vocabulary(models.Model):
    refer_patterns = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)
    word = models.CharField(max_length=255, null=True, blank=True)
    pronunciation = models.CharField(max_length=255, null=True, blank=True)
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


class SinoVietnameseProperty(models.Model):
    strokes = models.IntegerField(default=0)
    radical = models.CharField(max_length=255, null=True, blank=True)
    pen_strokes = models.CharField(max_length=255, null=True, blank=True)
    shape = models.CharField(max_length=255, null=True, blank=True)
    unicode = models.CharField(max_length=255, null=True, blank=True)
    frequency = models.IntegerField(default=0)


class Kanji(models.Model):
    character = models.CharField(max_length=255, null=True, blank=True)
    meaning = models.CharField(max_length=255)
    sino_vietnamese = models.CharField(max_length=255, null=True, blank=True)
    properties = models.ForeignKey(
        SinoVietnameseProperty, on_delete=models.CASCADE, related_name='kanji')
    onyomi = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)
    kunyomi = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)
    examples = ArrayField(models.CharField(
        max_length=255), blank=True, null=True, default=list)


class JPVocab(Vocabulary):
    kanji = models.CharField(max_length=255, blank=True, null=True)
    sino_viet = models.CharField(max_length=255, blank=True, null=True)
    kanji_details = models.JSONField(blank=True, null=True)
    romaji = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.kanji


# class EngVocab(Vocabulary):
#     word = models.CharField(max_length=255, blank=True, null=True)
#     pronunciation = models.CharField(max_length=255, blank=True, null=True)

    # study_time =
