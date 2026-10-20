from database import Base
from passlib.context import CryptContext
from sqlalchemy import Column, ForeignKey, Integer, String

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Cards(Base):   
    __tablename__ = 'flashcard'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    front = Column(String, nullable=False)
    back = Column(String, nullable=False)

    def to_dict(self) -> dict:
        return {"id": self.id, "front": self.front, "back": self.back}

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)

    def get_password_hash(self, password: str) -> None:
        self.password = pwd_context.hash(password)

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password)