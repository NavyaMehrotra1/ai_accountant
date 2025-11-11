from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.models import User, Transaction, get_db
from app.services.ai_service import AIService
from app.services.accounting import AccountingService
from app.auth import get_current_user

router = APIRouter()
ai_service = AIService()
accounting_service = AccountingService()


@router.get("/ai/insights")
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered financial insights and recommendations
    """
    try:
        # Get user's transactions
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).order_by(Transaction.date.desc()).all()
        
        if not transactions:
            return {
                "insights": [],
                "recommendations": [],
                "message": "Upload some transactions to get personalized insights!"
            }
        
        # Get financial summary
        summary = accounting_service.get_summary(db, current_user.id)
        
        # Convert transactions to dict
        tx_list = [
            {
                "date": tx.date.isoformat() if tx.date else None,
                "vendor": tx.vendor,
                "amount": float(tx.amount) if tx.amount else 0,
                "category": tx.category,
                "description": tx.description
            }
            for tx in transactions
        ]
        
        # Generate insights using Claude AI
        insights = ai_service.generate_financial_insights(tx_list, summary)
        
        return {
            "success": True,
            **insights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")


@router.get("/ai/anomalies")
async def detect_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Detect unusual spending patterns and potential fraud
    """
    try:
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).order_by(Transaction.date.desc()).all()
        
        if not transactions:
            return {
                "anomalies": [],
                "message": "No transactions to analyze"
            }
        
        tx_list = [
            {
                "date": tx.date.isoformat() if tx.date else None,
                "vendor": tx.vendor,
                "amount": float(tx.amount) if tx.amount else 0,
                "category": tx.category
            }
            for tx in transactions
        ]
        
        anomalies = ai_service.detect_anomalies(tx_list)
        
        return {
            "success": True,
            "anomalies": anomalies,
            "count": len(anomalies)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error detecting anomalies: {str(e)}")


@router.get("/ai/tax-deductions")
async def find_tax_deductions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Identify potential tax deductions
    """
    try:
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).all()
        
        if not transactions:
            return {
                "deductions": [],
                "total_potential": 0,
                "message": "No transactions to analyze"
            }
        
        tx_list = [
            {
                "date": tx.date.isoformat() if tx.date else None,
                "vendor": tx.vendor,
                "amount": float(tx.amount) if tx.amount else 0,
                "category": tx.category,
                "description": tx.description
            }
            for tx in transactions
        ]
        
        deductions = ai_service.find_tax_deductions(
            tx_list, 
            current_user.account_type or "individual"
        )
        
        return {
            "success": True,
            **deductions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding deductions: {str(e)}")


@router.get("/ai/forecast")
async def forecast_spending(
    months: int = 3,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Forecast future spending based on historical data
    
    Query params:
        months: Number of months to forecast (default: 3)
    """
    try:
        if months < 1 or months > 12:
            raise HTTPException(status_code=400, detail="Months must be between 1 and 12")
        
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).order_by(Transaction.date).all()
        
        if not transactions:
            return {
                "forecast": [],
                "message": "Need historical data to generate forecast"
            }
        
        tx_list = [
            {
                "date": tx.date.isoformat() if tx.date else None,
                "vendor": tx.vendor,
                "amount": float(tx.amount) if tx.amount else 0,
                "category": tx.category
            }
            for tx in transactions
        ]
        
        forecast = ai_service.forecast_spending(tx_list, months)
        
        return {
            "success": True,
            **forecast
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating forecast: {str(e)}")
