from database import Base
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

class Cards(Base):   
    __tablename__ = 'flashcard'
    id = Column(Integer, primary_key=True)
    front = Column(String)
    back = Column(String)

    def to_dict(self) -> dict:
        return {"id": self.id, "front": self.front, "back": self.back}