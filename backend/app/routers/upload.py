from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime
from typing import List

from app.models import Transaction, User, get_db
from app.services.ocr_service import OCRService
from app.services.ai_service import AIService
from app.auth import get_current_user

router = APIRouter()
ocr_service = OCRService()
ai_service = AIService()

# Ensure upload directory exists
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp'}
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB default


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process a financial document (receipt, invoice, etc.)
    
    Args:
        file: Uploaded file
        db: Database session
        
    Returns:
        Processed transaction data
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    try:
        # Save file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text using OCR
        extracted_text = ocr_service.extract_text(file_path)
        
        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from document. Please ensure the image is clear."
            )
        
        # Parse with AI
        parsed_data = ai_service.parse_receipt(extracted_text)
        
        # Create transaction
        transaction = Transaction(
            user_id=current_user.id,
            date=datetime.fromisoformat(parsed_data["date"]) if parsed_data.get("date") else datetime.now(),
            amount=parsed_data.get("amount") or 0.0,
            vendor=parsed_data.get("vendor"),
            category=parsed_data.get("category"),
            description=parsed_data.get("description"),
            document_path=file_path,
            raw_text=extracted_text
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return {
            "success": True,
            "message": "Document processed successfully",
            "transaction": {
                "id": transaction.id,
                "date": transaction.date.isoformat() if transaction.date else None,
                "amount": float(transaction.amount),
                "vendor": transaction.vendor,
                "category": transaction.category,
                "description": transaction.description
            },
            "extracted_text": extracted_text[:500]  # First 500 chars for preview
        }
    
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if processing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.post("/upload/batch")
async def upload_batch(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process multiple documents at once
    
    Args:
        files: List of uploaded files
        db: Database session
        
    Returns:
        Results for each file
    """
    results = []
    
    for file in files:
        try:
            result = await upload_document(file, current_user, db)
            results.append({
                "filename": file.filename,
                "success": True,
                "data": result
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return {
        "total": len(files),
        "successful": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"]),
        "results": results
    }
