import base64
import json
from random import shuffle
import random
import re
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.forms import formset_factory, model_to_dict

from .enums import TEST_MODE_CHOICES
from .forms import TopicForm, VocabularyForm
from .models import Topic, Vocabulary

VocabularyFormSet = formset_factory(VocabularyForm, extra=0)


def success_view(request):
    return render(request, 'success.html')

# Create your views here.


def index(request):
    context = {}
    return render(request, 'index.html', context)


def vocab_list(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    vocabularies = Vocabulary.objects.filter(topic=topic).order_by('id').values()
    if request.method == 'POST':
        formset = VocabularyFormSet(request.POST)
        if formset.is_valid():
            # Delete vocabulary not exist in cleaned_data
            vocabulary_ids = [form.cleaned_data.get(
                'id') for form in formset if form.cleaned_data.get('id')]
            deleted_vocabularies = Vocabulary.objects.filter(
                topic=topic).exclude(id__in=vocabulary_ids)
            deleted_vocabularies.delete()
            for form in formset:
                if form.is_valid():
                    cleaned_data = form.cleaned_data
                    # check if vocabulary already exists
                    if cleaned_data['id']:
                        vocabulary = get_object_or_404(
                            Vocabulary, id=cleaned_data['id'])
                        vocabulary.word = cleaned_data['word']
                        vocabulary.pronunciation = cleaned_data['pronunciation']
                        vocabulary.image_url = cleaned_data['image_url']
                        vocabulary.meaning = cleaned_data['meaning']
                        vocabulary.save()
                    else:
                        Vocabulary.objects.create(
                            word=cleaned_data['word'],
                            pronunciation=cleaned_data['pronunciation'],
                            image_url = cleaned_data['image_url'],
                            meaning=cleaned_data['meaning'],
                            topic=topic,
                        )
            return HttpResponseRedirect('/success/')
    else:
        vocabularies_values = vocabularies.values()
        formset = VocabularyFormSet(initial=vocabularies_values)
    return render(request, 'add.html', {'formset': formset, 'topic': topic})


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

# get study.html


def study(request):
    if request.method == 'POST':
        topic_ids = json.loads(request.POST.get('topic_ids'))
        vocabularies = Vocabulary.objects.filter(topic__in=topic_ids).order_by('id')

        vocabulary_dict =[model_to_dict(v) for v in vocabularies]
        return JsonResponse({'vocabularies': vocabulary_dict}, safe=False)
    else:
        return render(request, 'study.html')


def handle_typing(request):
     if request.method == "POST":
        # Lấy dữ liệu từ request
        inputText = request.POST.get('input')
        vocabId = request.POST.get('vocab')
        vocabulary = Vocabulary.objects.get(id=vocabId)
        words = re.split('\s*;\s*|\s*；\s*|\s*\n\s*',inputText)
        incorrect_words = []
        for word in words:
            if len(word.strip()) != 0:
                vocabulary.attempts_total = vocabulary.attempts_total + 1
                if word == vocabulary.word or word == vocabulary.pronunciation:
                    vocabulary.attempts_correct = vocabulary.attempts_correct + 1
                else:
                    if not vocabulary.attempts_incorrect:
                        vocabulary.attempts_incorrect = []
                    vocabulary.attempts_incorrect.append(word)
                    incorrect_words.append(word)
        vocabulary.save()
        vocabulary_dict = model_to_dict(vocabulary)
        vocabulary_dict['incorect_word_last'] = incorrect_words
        # Trả về response là một đối tượng JSON
        return JsonResponse(vocabulary_dict)

def pronunciation_or_word(words):
    words_convert= []
    for word in words:
        if word.pronunciation:
            words_convert.append(word.pronunciation)
        else:
            words_convert.append(word.word)
    return words_convert

def review(request):
    if request.method == 'POST':
        topic_ids = json.loads(request.POST.get('topic_ids'))
        vocabularies = Vocabulary.objects.filter(topic__in=topic_ids).order_by('id')
        from_word = int(request.POST.get('from', 0))
        to_word = int(request.POST.get('to', len(vocabularies)))
        vocabularies = list(vocabularies[from_word:to_word+1])
        questions = []
        for vocab in vocabularies:
            noise_words = [w for w in vocabularies if w.id != vocab.id]
            noise_words = list(noise_words)
            shuffle(noise_words)
            # mode = random.choice(TEST_MODE_CHOICES)
            mode = ('word','')
            correct_answer = vocab.word
            question_text = ''
            if mode[0] == 'meaning' :                                               
                question_text = 'Meaning of "' + vocab.word +'" :'
                correct_answer = vocab.meaning
                answers = [noise_words[0].meaning, noise_words[1].meaning, noise_words[2].meaning, vocab.meaning]
            elif mode[0] == 'pronunciation':
                question_text = 'Pronunciation of "' + vocab.word +'" :'
                correct_answer = vocab.pronunciation
                answers = [a for a in answers if a.pronunciation]
                answers = [noise_words[0].pronunciation, noise_words[1].pronunciation, noise_words[2].pronunciation, vocab.pronunciation]
            elif mode[0] == 'word':
                question_text = 'Word of "' + vocab.meaning +'" :'
                correct_answer = vocab.word
                answers = [noise_words[0].word, noise_words[1].word, noise_words[2].word, vocab.word]
            
            shuffle(answers)
            question = {
                'word_id': vocab.id,
                'word': vocab.word,
                'question':question_text,
                'correct_answer': correct_answer,
                'distractors': answers,
                'flag':vocab.flag,
                'uncheck_ifnull':vocab.uncheck_ifnull,
            }
            questions.append(question)
        shuffle(questions)
        # vocabulary_dict =[model_to_dict(v) for v in vocabularies]
        return JsonResponse({'questions': questions}, safe=False)
    else:
        return render(request, 'review.html')

def handle_review(request):
    if request.method == "POST":
        # Lấy dữ liệu từ request
        questions = json.loads(request.POST.get('questions'))

        for question in questions:
            word = Vocabulary.objects.get(id=question['word_id'])
            if not word:
                continue
            word.flag = question['flag']
            word.uncheck_ifnull = question['uncheck_ifnull']
            word.checks_total = word.checks_total + 1
            if question['answer'] == question['correct_answer']:
                word.checks_correct = word.checks_correct + 1
            else :
                if question['answer'] == 'no answer' and word.uncheck_ifnull:
                    continue
                if not word.checks_incorrect:
                    word.checks_incorrect = []
                word.checks_incorrect.append(question['answer'])
            word.save()
        # Trả về response là một đối tượng JSON
        return JsonResponse({'success': True})
    
def my_pdf_view(request):
    # Open the PDF file
    with open('C:/Users/MinhDua/Downloads/Toiec.pdf', 'rb') as f:
        pdf_data = f.read()

    # Encode the PDF data as base64
    encoded_pdf = base64.b64encode(pdf_data).decode('utf-8')

    # Return the response as base64-encoded string
    return HttpResponse(encoded_pdf)