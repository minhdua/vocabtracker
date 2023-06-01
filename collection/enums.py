from enum import Enum
from enumchoicefield import ChoiceEnum


PARTS_OF_SPEECH_CHOICES = [
    (None, 'Select parts of speech'),
    ('noun', 'Noun'),
    ('verb', 'Verb'),
    ('adjective', 'Adjective'),
    ('adverb', 'Adverb'),
    ('preposition', 'Preposition'),
    ('conjunction', 'Conjunction'),
    ('interjection', 'Interjection'),
]

TEST_MODE_CHOICES = [
    ('meaning', 'Kiểm tra nghĩa'),
    ('spelling', 'Kiểm tra từ'),
    ('part_of_speech', 'Kiểm tra từ loại'),
    ('kanji', 'Kiểm tra hán nhật'),
    ('picture', 'Kiểm tra bằng hình ảnh'),
]


class PrettyEnum(Enum):
    def __init__(self, value, display_text):
        self._value_ = value
        self.display_text = display_text


class ChoiceEnum(PrettyEnum):
    @classmethod
    def choices(cls):
        return tuple((item.value, item.display_text) for item in cls)


class LanguageEnum(ChoiceEnum):
    ENGLISH = 'EN', 'English'
    JAPANESE = 'JA', 'Japanese'
    # Add more languages as needed
