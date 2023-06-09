from django import forms

from .models import JPVocab, Topic, Vocabulary


class VocabularyForm(forms.ModelForm):
    # Add a hidden input for the vocabulary id
    id = forms.IntegerField(widget=forms.HiddenInput(), required=False)
    pronunciation = forms.CharField(required=False)

    class Meta:
        model = Vocabulary
        fields = ['id', 'word', 'pronunciation', 'meaning', 'image_url']


class JPVocabForm(forms.ModelForm):
    # Add a hidden input for the vocabulary id
    id = forms.IntegerField(widget=forms.HiddenInput(), required=False)
    pronunciation = forms.CharField(required=False)

    class Meta:
        model = JPVocab
        fields = ['id', 'word', 'pronunciation', 'meaning',
                  'image_url', 'kanji', 'romaji']


class TopicForm(forms.ModelForm):
    id = forms.IntegerField(widget=forms.HiddenInput())

    class Meta:
        model = Topic
        fields = ('id', 'name', 'description', 'image_url')
        # Optional widget to display image thumbnail and allow clearing of image
        widgets = {'image_url': forms.ClearableFileInput()}
        labels = {'image_url': 'Image'}  # Optional label for the image field
        required = {'image_url': False}  # Set image_url field to not required
    description = forms.CharField(required=False, widget=forms.Textarea)
