import os
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
