from django import forms

from .models import Topic, Vocabulary

class VocabularyForm(forms.Form):
    # word = forms.CharField(max_length=255)
    # pronunciation  = forms.CharField(max_length=255)
    # meaning = forms.CharField(max_length=255)
    class Meta:
        model = Vocabulary
        fields = ['word', 'pronunciation', 'meaning']
        widgets = {
            'word': forms.TextInput(attrs={'contenteditable': 'true'}),
            'pronunciation': forms.TextInput(attrs={'contenteditable': 'true'}),
            'meaning': forms.TextInput(attrs={'contenteditable': 'true'}),
        }
        
class TopicForm(forms.ModelForm):
    class Meta:
        model = Topic
        fields = ('name', 'description', 'image_url')
        widgets = {'image_url': forms.ClearableFileInput()}  # Optional widget to display image thumbnail and allow clearing of image
        labels = {'image_url': 'Image'}  # Optional label for the image field
        required = {'image_url': False}  # Set image_url field to not required