# Language Cards

A web application for learning languages with digital flashcards. Users can register, log in, and manage their own cards.

## Features

- **User Authentication** — registration and login with password hashing and JWT authentication.
- **Personal Flashcards** — each user can access and manage only their own cards.
- **CRUD Operations** — create, view, update, and delete flashcards.
- **Interactive Interface** — flip cards to reveal translations and navigate between them.
- **REST API** — backend endpoints built with FastAPI.
- **Persistent Storage** — PostgreSQL database managed through SQLAlchemy.

## Tech Stack

- **Python**
- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Pydantic**
- **JWT** — authentication
- **Passlib + bcrypt** — password hashing
- **HTML, CSS, JavaScript**
- **Uvicorn**

## Live Demo

[Try Language Cards](https://language-cards-6vh3.onrender.com/)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Minuanoooo/language_cards.git
cd language_cards
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgresql_database_url
SECRET_KEY=your_secret_key
```

Use your own PostgreSQL connection URL and a randomly generated secret key. Never commit `.env` to GitHub.

### 5. Run the application

```bash
uvicorn main:app --reload
```

Open http://127.0.0.1:8000 in your browser.

Interactive API documentation is available at http://127.0.0.1:8000/docs.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/users` | Register a new user |
| POST | `/login` | Authenticate a user |
| GET | `/cards` | Get the authenticated user's cards |
| POST | `/cards` | Create a flashcard |
| PUT | `/cards/{card_id}` | Update a flashcard |
| DELETE | `/cards/{card_id}` | Delete a flashcard |

Card operations require authentication.

## Project Structure

```text
language_cards/
├── main.py          # FastAPI application and API endpoints
├── auth.py          # JWT authentication
├── models.py        # SQLAlchemy models
├── database.py      # Database configuration
├── requirements.txt # Python dependencies
├── static/
│   ├── index.html   # Main page
│   ├── style.css    # Styling
│   └── script.js    # Frontend logic
└── .gitignore
```

## Purpose

This project was built to practice backend development with Python and FastAPI, database integration, authentication, and frontend-backend communication.

It demonstrates how to build a REST API with user-specific data and persistent storage.