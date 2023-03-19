from django import forms

from .models import Question, Test, Topic, Vocabulary


class VocabularyForm(forms.ModelForm):
    # Add a hidden input for the vocabulary id
    id = forms.IntegerField(widget=forms.HiddenInput(), required=False)
    pronunciation = forms.CharField(required=False)

    class Meta:
        model = Vocabulary
        fields = ['id', 'word', 'pronunciation', 'meaning']


class TopicForm(forms.ModelForm):
    class Meta:
        model = Topic
        fields = ('name', 'description', 'image_url')
        # Optional widget to display image thumbnail and allow clearing of image
        widgets = {'image_url': forms.ClearableFileInput()}
        labels = {'image_url': 'Image'}  # Optional label for the image field
        required = {'image_url': False}  # Set image_url field to not required
    description = forms.CharField(required=False, widget=forms.Textarea)
