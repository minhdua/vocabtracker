from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.forms import formset_factory
from .forms import TopicForm, VocabularyForm
from .models import Topic, Vocabulary

VocabularyFormSet = formset_factory(VocabularyForm, extra=3)
def success_view(request):
    return render(request,'success.html')
# Create your views here.
def index(request):
    context = {}
    return render(request, 'index.html',context)

def add(request):
    if request.method == 'POST':
        formset = VocabularyFormSet(request.POST)
        if formset.is_valid():
            for form in formset:
                if (form.is_valid()):
                    vocabulary = Vocabulary(
                        word = form.cleaned_data['word'],
                        pronunciation =form.cleaned_data['pronunciation'],
                        meaning = form.cleaned_data['meaning']
                    )
                    vocabulary.save()
            return HttpResponseRedirect('/success/')
    else:
        formset = VocabularyFormSet()
    return render(request, 'add.html',{'formset': formset})

def topic_list(request):
    topics = Topic.objects.all()
    return render(request, 'list.html', {'topics': topics})

def add_topic(request):
    
    if request.method == 'POST':
        form = TopicForm(request.POST)
        if form.is_valid():
            topic = form.save(commit=False)
            topic.save()
            return redirect('topic_list')
        else:
            print(form.errors)
    else:
        form = TopicForm()
    return render(request, 'add_topic.html', {'form': form})