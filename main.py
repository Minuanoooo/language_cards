from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db
from auth import create_access_token, get_current_user
from models import Cards, User
from fastapi.responses import FileResponse

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

Base.metadata.create_all(engine)

class CardCreate(BaseModel):
    front: str
    back: str

class UserCreate(BaseModel):
    email: str
    password: str

@app.get("/")
def home():
    return FileResponse("static/index.html")

@app.post('/cards')
def create_cards(
    card: CardCreate,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    new_card = Cards(front = card.front, back = card.back, user_id = current_user)
    db.add(new_card)
    db.commit()
    return new_card.to_dict()

@app.get('/cards')
def get_cards(
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    note = db.query(Cards).filter(Cards.user_id == current_user).all()
    return [t.to_dict() for t in note]  


@app.delete('/cards/{card_id}')
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    note_to_delete = db.query(Cards).filter(Cards.id == card_id,Cards.user_id == current_user,).first()
    if not note_to_delete:
        raise HTTPException(status_code=404, detail="card not found")
    db.delete(note_to_delete)
    db.commit()
    return {"message": "card deleted"}

@app.put('/cards/{card_id}')
def card_put(
    card: CardCreate,
    card_id: int,
    db: Session = Depends(get_db),
    current_user: int = Depends(get_current_user),
):
    card_to_put = db.query(Cards).filter(Cards.id == card_id,Cards.user_id == current_user,).first()
    if not card_to_put:
        raise HTTPException(status_code=404, detail="card not found")
    update_data = card.dict(exclude_unset=True) 
    for key, value in update_data.items():
        setattr(card_to_put, key, value)
    db.commit()
    db.refresh(card_to_put)
    return card_to_put.to_dict()

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(email=user.email)
    new_user.get_password_hash(user.password)
    existing_user = db.query(User).filter(User.email == user.email).first()
    if not existing_user:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"id": new_user.id, "email": new_user.email}
    raise HTTPException(status_code=409, detail="email is already using")


@app.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user and existing_user.verify_password(user.password):
        return {"access_token": create_access_token(existing_user.id),"token_type": "bearer",}
    raise HTTPException(status_code=401, detail="Unauthorized")