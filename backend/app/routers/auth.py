from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.models import User, get_db
from app.auth import (
    authenticate_user,
    create_access_token,
    get_password_hash,
    get_current_user
)

router = APIRouter()


# Pydantic models for request/response
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    account_type: Optional[str] = 'individual'
    company_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    account_type: Optional[str]
    company_name: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    account_type: Optional[str] = None
    company_name: Optional[str] = None


@router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        account_type=user_data.account_type,
        company_name=user_data.company_name
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "account_type": new_user.account_type,
            "company_name": new_user.company_name,
            "created_at": new_user.created_at.isoformat()
        }
    }


@router.post("/auth/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "account_type": user.account_type,
            "company_name": user.company_name,
            "created_at": user.created_at.isoformat()
        }
    }


@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "account_type": current_user.account_type,
        "company_name": current_user.company_name,
        "created_at": current_user.created_at.isoformat()
    }


@router.put("/auth/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.account_type is not None:
        current_user.account_type = user_update.account_type
    if user_update.company_name is not None:
        current_user.company_name = user_update.company_name
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "account_type": current_user.account_type,
        "company_name": current_user.company_name,
        "created_at": current_user.created_at.isoformat()
    }


@router.post("/auth/logout")
async def logout():
    """Logout (client should delete token)"""
    return {"message": "Successfully logged out"}
