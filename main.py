from fastapi import Depends, FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import Base, engine, get_db
from models import Cards
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

@app.get("/")
def home():
    return FileResponse("static/index.html")

@app.post('/cards')
def create_cards(
    card: CardCreate,
    db: Session = Depends(get_db),
):
    new_card = Cards(front = card.front, back = card.back)
    db.add(new_card)
    db.commit()
    return new_card.to_dict()

@app.get('/cards')
def get_cards(
    db: Session = Depends(get_db)
):
    note = db.query(Cards).all()
    return [t.to_dict() for t in note]


@app.delete('/cards/{card_id}')
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
):
    note_to_delete = db.query(Cards).filter(Cards.id == card_id).first()
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
):
    card_to_put = db.query(Cards).filter(Cards.id == card_id).first()
    if not card_to_put:
        raise HTTPException(status_code=404, detail="card not found")
    update_data = card.dict(exclude_unset=True) 
    for key, value in update_data.items():
        setattr(card_to_put, key, value)
    db.commit()
    db.refresh(card_to_put)
    return card_to_put.to_dict()