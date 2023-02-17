from django.db import models

# Create your models here.
class Vocabulary(models.Model):
    word = models.CharField(max_length=255)
    pronunciation = models.CharField(max_length=255)
    meaning = models.CharField(max_length=255)
    
class Topic(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    image_url =  models.ImageField(blank=True, null=True, upload_to='topic_images/')