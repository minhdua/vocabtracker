import json
import os
import re
import urllib.request
from typing import List


def extract_urls(keyword: str, filetype: str = 'png', limit: int = 1, offset: int = 1, size: str = None) -> List[str]:
    extensions = [f'.{filetype}'] if filetype else []
    main_directory = os.getcwd()
    keyword_encoded = urllib.parse.quote(keyword, encoding='utf-8')
    keyword_to_search = [keyword_encoded]

    size_filter = ""
    if size:
        size_filter = f"&tbs=islt:{size}"

    filetype_filter = f"itp:{filetype}," if filetype else ""
    url = f"https://www.google.com/search?q={'+'.join(keyword_to_search)}&source=lnms&tbm=isch&tbs="
    url += f"{filetype_filter}ic:trans{size_filter}&ved=0CAIQnB0oABAAahUKEwiBtJGdh8vzAhVGDqYKHXgoBpM&biw=1366&bih=657"

    headers = {
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    }
    req = urllib.request.Request(url, headers=headers)
    resp = urllib.request.urlopen(req)
    respData = str(resp.read())

    urls = []
    j = 0
    end_object = 0
    while j < limit:
        while True:
            try:
                new_line = respData.find('"https://', end_object + 1)
                end_object = respData.find('"', new_line + 1)

                buffor = respData.find('\\', new_line + 1, end_object)
                if buffor != -1:
                    object_raw = (respData[new_line + 1:buffor])
                else:
                    object_raw = (respData[new_line + 1:end_object])

                if not extensions or any(extension in object_raw for extension in extensions):
                    urls.append(object_raw)
                    break

            except Exception as e:
                break

        j += 1
        end_object += 1

    return urls


def is_kanji(word):
    # Define the regular expression pattern for kanji characters
    kanji_pattern = re.compile(r'[\u4E00-\u9FFF]+')

    # Check if the word contains kanji characters
    match = kanji_pattern.search(word)
    return match is not None


def find_item_by_key(items, word, key):
    for item in items:
        if item[key] == word:
            return item
    return None


def get_sino_viet(kanji_bank, kanji):
    kanji_characters = [
        find_item_by_key(kanji_bank, char, 'character') for char in kanji if char.isalpha() and is_kanji(char)]
    sino_viet_characters = [char.get('sino_vietnamese').replace(' ', '/ ')
                            for char in kanji_characters if char is not None]
    sino_viet_details = [
        char for char in kanji_characters if char is not None]
    sino_viet = ' '.join(sino_viet_characters)
    return sino_viet, sino_viet_details

def load_json_from_path(path):
    if os.path.isfile(path):  # Kiểm tra xem đường dẫn là một tệp tin
        with open(path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        return data
    elif os.path.isdir(path):  # Kiểm tra xem đường dẫn là một thư mục
        data = []
        for file_name in os.listdir(path):
            file_path = os.path.join(path, file_name)
            if os.path.isfile(file_path) and file_name.endswith('.json'):  # Lọc các tệp tin có phần mở rộng .json
                with open(file_path, 'r', encoding='utf-8') as file:
                    file_data = json.load(file)
                data.extend(file_data)
        return data
    else:
        raise ValueError("Invalid path: " + path)