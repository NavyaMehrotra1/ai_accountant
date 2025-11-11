from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime

from app.models import Base, Transaction, User, engine, get_db
from app.routers import upload, reports, auth, ai_insights
from app.services.ai_service import AIService
from app.services.ocr_service import OCRService
from app.auth import get_current_user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Accountant API",
    description="Automated accounting with AI-powered document processing",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(ai_insights.router, prefix="/api", tags=["ai-insights"])

# Mount static files for demo images
demo_images_path = os.path.join(os.path.dirname(__file__), "..", "demo_images")
if os.path.exists(demo_images_path):
    app.mount("/demo", StaticFiles(directory=demo_images_path), name="demo")

# Initialize services
ai_service = AIService()
ocr_service = OCRService()


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI Accountant API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/transactions", response_model=List[dict])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all transactions with optional filtering"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if category:
        query = query.filter(Transaction.category == category)
    
    transactions = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": t.id,
            "date": t.date.isoformat() if t.date else None,
            "amount": float(t.amount),
            "vendor": t.vendor,
            "category": t.category,
            "description": t.description,
            "document_path": t.document_path,
            "created_at": t.created_at.isoformat()
        }
        for t in transactions
    ]


@app.get("/api/transactions/{transaction_id}")
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction by ID"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "id": transaction.id,
        "date": transaction.date.isoformat() if transaction.date else None,
        "amount": float(transaction.amount),
        "vendor": transaction.vendor,
        "category": transaction.category,
        "description": transaction.description,
        "document_path": transaction.document_path,
        "created_at": transaction.created_at.isoformat()
    }


@app.put("/api/transactions/{transaction_id}")
async def update_transaction(
    transaction_id: int,
    date: Optional[str] = None,
    amount: Optional[float] = None,
    vendor: Optional[str] = None,
    category: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if date:
        transaction.date = datetime.fromisoformat(date)
    if amount is not None:
        transaction.amount = amount
    if vendor:
        transaction.vendor = vendor
    if category:
        transaction.category = category
    if description:
        transaction.description = description
    
    db.commit()
    db.refresh(transaction)
    
    return {"message": "Transaction updated successfully", "id": transaction_id}


@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Delete associated file if it exists
    if transaction.document_path and os.path.exists(transaction.document_path):
        os.remove(transaction.document_path)
    
    db.delete(transaction)
    db.commit()
    
    return {"message": "Transaction deleted successfully", "id": transaction_id}


@app.get("/api/categories")
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all unique categories"""
    categories = db.query(Transaction.category).filter(
        Transaction.user_id == current_user.id
    ).distinct().all()
    return [cat[0] for cat in categories if cat[0]]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
