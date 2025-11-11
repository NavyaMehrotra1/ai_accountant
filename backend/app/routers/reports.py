from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.models import User, get_db
from app.services.accounting import AccountingService
from app.auth import get_current_user

router = APIRouter()
accounting_service = AccountingService()


@router.get("/reports/summary")
async def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get financial summary for a date range
    
    Query params:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
    """
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    summary = accounting_service.get_summary(db, current_user.id, start, end)
    
    return {
        "summary": summary,
        "date_range": {
            "start": start_date,
            "end": end_date
        }
    }


@router.get("/reports/category")
async def get_category_breakdown(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get spending breakdown by category
    
    Query params:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
    """
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    breakdown = accounting_service.get_category_breakdown(db, current_user.id, start, end)
    
    return {
        "categories": breakdown,
        "date_range": {
            "start": start_date,
            "end": end_date
        }
    }


@router.get("/reports/trend")
async def get_monthly_trend(
    months: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get monthly spending trend
    
    Query params:
        months: Number of months to include (default: 6)
    """
    trend = accounting_service.get_monthly_trend(db, current_user.id, months)
    
    return {
        "trend": trend,
        "months": months
    }


@router.get("/reports/export")
async def export_transactions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export transactions to CSV
    
    Query params:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
    """
    start = datetime.fromisoformat(start_date) if start_date else None
    end = datetime.fromisoformat(end_date) if end_date else None
    
    csv_data = accounting_service.export_to_csv(db, current_user.id, start, end)
    
    # Return as downloadable CSV
    filename = f"transactions_{datetime.now().strftime('%Y%m%d')}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
