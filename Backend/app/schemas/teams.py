# app/schemas/teams.py

from pydantic import BaseModel
from typing import Optional

class TeamInfo(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    name: str
    investment_id: int

class TeamCreate(TeamBase):
    pass

class Team(TeamBase):
    id: int

    class Config:
        from_attributes = True
