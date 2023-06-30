import base64
import json
from random import shuffle
import random
import urllib.parse
import re
import romaji
from django.views import View
from . import utils
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.forms import formset_factory, model_to_dict
from django.db.models import Q
from Levenshtein import distance

from .enums import TEST_MODE_CHOICES, LanguageEnum
from .forms import TopicForm, VocabularyForm
from .models import JPVocab, Topic, Vocabulary

VocabularyFormSet = formset_factory(VocabularyForm, extra=0)


def success_view(request):
    return render(request, 'success.html')

# Create your views here.


def index(request):
    context = {}
    return render(request, 'index.html', context)


def vocab_list(request, topic_id):
    topic = get_object_or_404(Topic, id=topic_id)
    if topic.language == LanguageEnum.JAPANESE:
        vocabularies = JPVocab.objects.filter(topic=topic).order_by('id').values()
        
    # elif topic.language == 'EN': TODO: add EN
    #     vocabularies = Vocabulary.objects.filter(topic=topic).order_by('id').values()
    else:
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
                        if topic.language == LanguageEnum.ENGLISH:
                            vocabulary.word = cleaned_data['word']
                            vocabulary.pronunciation = cleaned_data['pronunciation']
                            vocabulary.refer_patterns = [vocabulary.word]

                        if topic.language == LanguageEnum.JAPANESE:
                            vocabulary = get_object_or_404(
                                JPVocab, id=cleaned_data['id'])
                            
                            
                            vocabulary.word = cleaned_data['word']
                            vocabulary.pronunciation = cleaned_data['pronunciation']
                            

                            vocabulary.romaji = romaji.transliterate(vocabulary.word)
                            vocabulary.kanji=vocabulary.pronunciation #TODO: change field after 
                            vocabulary.katakana=None
                            vocabulary.refer_patterns = [vocabulary.kanji, vocabulary.word]
                            vocabulary.refer_patterns.extend(vocabulary.romaji)

                        vocabulary.meaning = cleaned_data['meaning']
                        image_url = cleaned_data['image_url']
                        # Nếu image_url null thì lấy url từ utils
                        if image_url is None or image_url == '':
                            images = utils.extract_urls('image for vocabulary '+vocabulary.meaning,limit=10)
                             #get random 1 image
                            image_url =  random.choice(images[2:])
                        vocabulary.image_url = image_url
                        vocabulary.meaning = cleaned_data['meaning']
                        vocabulary.save()
                    else:
                        if topic.language == LanguageEnum.ENGLISH:
                            Vocabulary.objects.create(
                                word=cleaned_data['word'],
                                pronunciation=cleaned_data['pronunciation'],
                                image_url = cleaned_data['image_url'],
                                meaning=cleaned_data['meaning'],
                                topic=topic,
                                refer_patterns=[cleaned_data['word']],
                            )
                        elif topic.language == LanguageEnum.JAPANESE:
                            romajii = romaji.transliterate(cleaned_data['word'])
                            partterns = [cleaned_data['word'],cleaned_data['pronunciation']]
                            partterns.extend(romajii)
                            JPVocab.objects.create(
                                word=cleaned_data['word'],
                                pronunciation=cleaned_data['pronunciation'],
                                image_url = cleaned_data['image_url'],
                                meaning=cleaned_data['meaning'],
                                topic=topic,
                                kanji=cleaned_data['pronunciation'],
                                refer_patterns= partterns,
                            )
            return HttpResponseRedirect('/success/')
    elif request.method == 'GET':
        vocabularies_values = vocabularies.values()
        formset = VocabularyFormSet(initial=vocabularies_values)
    else:
        formset = VocabularyFormSet()
    return render(request, 'add.html', {'formset': formset, 'topic': topic})

def topic_search(request):
    if request.method == 'POST':
        search_term = request.POST.get('search_term')
        if search_term is None or search_term == '':
            return redirect('topic_list')
        # get vocabulary by search term word or pronunciation or meaning
        vocabularies = Vocabulary.objects.filter(
            Q(word__icontains=search_term) | 
            Q(pronunciation__icontains=search_term) | 
            Q(meaning__icontains=search_term)
        )
        results = []
        for vocabulary in vocabularies:
            result = {
                'word': vocabulary.word,
                'pronunciation': vocabulary.pronunciation,
                'meaning': vocabulary.meaning,
                'topic': vocabulary.topic.name,
                'attempts': {
                    'total': vocabulary.attempts_total,
                    'right': vocabulary.attempts_correct,
                },
                'checks': {
                    'total': vocabulary.checks_total,
                    'right': vocabulary.checks_correct,
                },
            }
            results.append(result)
        return JsonResponse(results, safe=False)
    else:
        return redirect('topic_list')
    
def topic_list(request):
    topics = Topic.objects.order_by('index', 'id').all()
    # additional totals, typings, reviews for topic
    for topic in topics:
        topic.description = '' if topic.description is None else topic.description
        topic.totals = Vocabulary.objects.filter(topic=topic).count()
        topic.typings = 0
        topic.reviews = 0
        for vocabulary in Vocabulary.objects.filter(topic=topic):
            topic.typings += vocabulary.attempts_total
            topic.reviews += vocabulary.checks_total

    return render(request, 'list.html', {'topics': topics})


def topic(request):
    if request.method == 'POST':
        topic_id = request.POST.get('id')
        if topic_id:
            topic = get_object_or_404(Topic, id=topic_id)
            topic.name = request.POST.get('name')
            topic.index = request.POST.get('index')
            topic.description = request.POST.get('description')
            topic.image_url = request.POST.get('image_url')
            topic.save()
        else:
            Topic.objects.create(
                name=request.POST.get('name'),
                index=request.POST.get('index'),
                description=request.POST.get('description'),
                image_url=request.POST.get('image_url'),
            )
        return HttpResponse(status=200, content='success')
    elif request.method == 'DELETE':
        payload_dict = urllib.parse.parse_qs(request.body.decode('utf-8'))
        topic_id = int(payload_dict.get('topic_id')[0])
        topic = get_object_or_404(Topic, id=topic_id)
        topic.delete()
        return JsonResponse({'success': True})
    else:
        form = TopicForm()
    return redirect('topic_list')

def pronunciation_or_word(words):
    words_convert= []
    for word in words:
        if word.pronunciation:
            words_convert.append(word.pronunciation)
        else:
            words_convert.append(word.word)
    return words_convert

def find_most_similar_words(word, word_list):
    distances = [(w, distance(word.word, w.word)) for w in word_list]
    sorted_distances = sorted(distances, key=lambda x: x[1])
    return [w[0] for w in sorted_distances[:3]]

def review(request):
    topic_ids = request.GET.getlist('topic_id') 
    #if not topic_ids then get all topics
    if not topic_ids:
        topic_ids = Topic.objects.all().values_list('id', flat=True)
    vocabularies = Vocabulary.objects.filter(topic__in=topic_ids).order_by('id')
    from_word = int(request.GET.get('from', 0))
    to_word = int(request.GET.get('to', len(vocabularies)))
    vocabularies = list(vocabularies[from_word:to_word+1])
    questions = []
    for vocab in vocabularies:
        seen_words = set()
        noise_words = []
        for w in vocabularies:
            if w.id != vocab.id and w.word not in seen_words:
                noise_words.append(w)
                seen_words.add(w.word)
        noise_words = find_most_similar_words(vocab,list(noise_words))
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
            'type': mode[0],
        }
        questions.append(question)
    shuffle(questions)
    # vocabulary_dict =[model_to_dict(v) for v in vocabularies]
    return render(request, 'review.html', {'questions': questions}
)

def handle_review(request):
    if request.method == "POST":
        # Lấy dữ liệu từ request
        questions = json.loads(request.POST.get('questions'))
        result = {
            'total': len(questions),
            'correct': 0,
            'incorrect': 0,
        }

        for question in questions:
            word = Vocabulary.objects.get(id=question['word_id'])
            if not word:
                continue
            word.flag = question['flag']
            word.uncheck_ifnull = question['uncheck_ifnull']
            word.checks_total = word.checks_total + 1
            if question['answer'] == question['correct_answer']:
                word.checks_correct = word.checks_correct + 1
                result['correct'] = result['correct'] + 1
            else :
                if question['answer'] == 'no answer' and word.uncheck_ifnull:
                    continue
                if not word.checks_incorrect:
                    word.checks_incorrect = []
                word.checks_incorrect.append(question['answer'])
                result['incorrect'] = result['incorrect'] + 1
            word.save()
        # Trả về response là một đối tượng JSON
        return JsonResponse({'success': True, 'result': result})
    
def my_pdf_view(request):
    # Open the PDF file
    with open('C:/Users/MinhDua/Downloads/Toiec.pdf', 'rb') as f:
        pdf_data = f.read()

    # Encode the PDF data as base64
    encoded_pdf = base64.b64encode(pdf_data).decode('utf-8')

    # Return the response as base64-encoded string
    return HttpResponse(encoded_pdf)

#region Vocabulary View
class VocabularyView(View):
    def get(self, request, topic_id):
        topic = get_object_or_404(Topic, id=topic_id)
        if topic.language == LanguageEnum.JAPANESE:
            vocabularies = JPVocab.objects.filter(topic=topic).order_by('id').values()
            
        else:
            vocabularies = Vocabulary.objects.filter(topic=topic).order_by('id').values()
        
        return render(request, 'vocabularies.html', context={'topic':topic, 'vocabularies':vocabularies})
#endregion

#region Study

def study(request):
    topic_ids = request.GET.getlist('topic_id')
    #if not topic_ids then get all topics
    if not topic_ids:
        topic_ids = Topic.objects.all().values_list('id', flat=True)
    vocabularies = Vocabulary.objects.filter(topic__in=topic_ids).order_by('id')
    vocabulary_dict =[model_to_dict(v) for v in vocabularies]
    # return JsonResponse({'vocabularies': vocabulary_dict}, safe=False)
    return render(request, 'study.html', {'vocabularies': vocabulary_dict})


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
                #những từ trong ngoặc vuông hoặc ngoặc tròn thì không lấy để so sánh
                _word = re.sub(r'[\(\[].*?[\)\]]', '', vocabulary.word)
                _pronunciation = vocabulary.pronunciation
                if word == _pronunciation or word == _word:
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
     
class StudyView(View):
    def get(self,request):
        topic_ids = request.GET.getlist('topic_id')
        #if not topic_ids then get all topics
        if not topic_ids:
            topic_ids = Topic.objects.all().values_list('id', flat=True)
        topics = Topic.objects.filter(id__in=topic_ids).order_by('id')
        vocabularies = []
        for topic in topics:
            if topic.language == LanguageEnum.JAPANESE:
                vocab_list = JPVocab.objects.filter(topic=topic).order_by('id')
            else:
                vocab_list = Vocabulary.objects.filter(topic=topic).order_by('id')
            vocabularies.extend(vocab_list)

        vocabulary_dict =[model_to_dict(v) for v in vocabularies]
        for vocab in vocabulary_dict:
            topic = topics.get(id=vocab['topic'])
            vocab['topic_name'] = topic.name
            vocab['lang'] = topic.language.value
        # return JsonResponse({'vocabularies': vocabulary_dict}, safe=False)
        return render(request, 'study.html', {'vocabularies': vocabulary_dict, 'vocabulary':vocabulary_dict[0]})

    def post(self, request):
         # Lấy dữ liệu từ request
        inputText = request.POST.get('input')
        vocabId = request.POST.get('vocab')
        vocabulary = Vocabulary.objects.get(id=vocabId)
        words = re.split('\s*;\s*|\s*；\s*|\s*\n\s*',inputText)
        incorrect_words = []
        for word in words:
            if len(word.strip()) != 0:
                vocabulary.attempts_total = vocabulary.attempts_total + 1
                #những từ trong ngoặc vuông hoặc ngoặc tròn thì không lấy để so sánh
                _word = re.sub(r'[\(\[].*?[\)\]]', '', vocabulary.word)
                _pronunciation = vocabulary.pronunciation
                refer_patterns = vocabulary.refer_patterns
                if word in refer_patterns:
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
#endregion
