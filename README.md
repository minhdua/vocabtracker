# Vocabulary Tracker

### Description

The project helps us store vocabulary during language learning, allowing us to track the learning progress, review, and look up words when needed.

### Installation Guide

1. Clone the project from GitHub.

```bash
git clone https://github.com/minhdua/vocabtracker.git
```

2. Set up environment variables.

```bash
export DB_NAME=${your_db_name}
export DB_HOST=${your_db_host}
export DB_PORT=${your_db_port}
export DB_USER=${your_db_username}
export DB_PASSWORD=${your_db_password}
```

3. Set up virtual environment.

```bash
pip install virtualenv
python -m venv venv
```

4. Activate virtual environment.

- Windows

```bash
venv\Scripts\activate
```

- Linux

```bash
source venv/bin/activate
```

5. Install packages.

```bash
pip install -r requirements.txt
```

Note: You may want to upgrade pip before installing the packages.

```bash
python -m pip install --upgrade pip
```

6. Collect static files.

```bash
python manage.py collectstatic
```

7. Run the server.

```bash
python manage.py runserver
```

### Xây dựng project

1. format django template

```bash
djhtml <template.html>
```

### Liên Hệ

- Author: Minh Dua
- Email: [minhdua@gmail.com](vothanhhienag1996@gmail.com)
- Twitter: [@minhdua](https://twitter.com/minhdua)
- LinkedIn: [minhdua](https://www.linkedin.com/in/minhdua/)
- Project Management: [https://github.com/minhdua/projects](https://github.com/minhdua)

### Tham khảo

1. [kanjidic-index](https://github.com/macalinao/kanjidic-index) repository by Macalinao.
2. [KanjiDictVN](https://github.com/trungnt2910/KanjiDictVN) repository.
