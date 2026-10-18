# Language Cards

A simple web application for learning languages with flashcards. Each card contains a word or phrase on the front and its translation or explanation on the back.

## Technologies

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- HTML
- CSS
- JavaScript

## Features

- Create flashcards with words, phrases, and translations
- Flip cards to reveal the answer
- Navigate between flashcards
- Edit existing flashcards
- Delete flashcards
- Store flashcards in a PostgreSQL database
- Persistent data storage in the deployed application

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Minuanoooo/language_cards.git
   cd language_cards
   ```

2. Create and activate a virtual environment:

   **Windows**

   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

   **Linux / macOS**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set the `DATABASE_URL` environment variable to your PostgreSQL connection URL.

5. Run the application:

   ```bash
   uvicorn main:app --reload
   ```

6. Open the application at:

   ```text
   http://127.0.0.1:8000
   ```

## API Endpoints

| Method | Endpoint           | Description             |
| ------ | ------------------ | ----------------------- |
| GET    | `/cards`           | Retrieve all flashcards |
| POST   | `/cards`           | Create a new flashcard  |
| PUT    | `/cards/{card_id}` | Update a flashcard      |
| DELETE | `/cards/{card_id}` | Delete a flashcard      |

## Project Structure

```text
language_cards/
├── main.py
├── database.py
├── models.py
├── static/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── requirements.txt
└── README.md
```

## Live Demo

[https://language-cards-6vh3.onrender.com/](https://language-cards-6vh3.onrender.com/)
