from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models import Transaction
from datetime import datetime, timedelta
from typing import Dict, List
import pandas as pd


class AccountingService:
    """Service for financial calculations and reporting"""

    @staticmethod
    def get_summary(db: Session, user_id: int, start_date: datetime = None, end_date: datetime = None) -> Dict:
        """
        Get financial summary for a date range
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            
        Returns:
            Dictionary with summary statistics
        """
        query = db.query(Transaction).filter(Transaction.user_id == user_id)
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        transactions = query.all()
        
        total_expenses = sum(t.amount for t in transactions if t.amount > 0)
        total_income = sum(abs(t.amount) for t in transactions if t.amount < 0)
        transaction_count = len(transactions)
        
        # Average transaction
        avg_transaction = total_expenses / transaction_count if transaction_count > 0 else 0
        
        return {
            "total_expenses": round(total_expenses, 2),
            "total_income": round(total_income, 2),
            "net": round(total_income - total_expenses, 2),
            "transaction_count": transaction_count,
            "average_transaction": round(avg_transaction, 2)
        }

    @staticmethod
    def get_category_breakdown(db: Session, user_id: int, start_date: datetime = None, end_date: datetime = None) -> List[Dict]:
        """
        Get spending breakdown by category
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            
        Returns:
            List of category summaries
        """
        query = db.query(
            Transaction.category,
            func.sum(Transaction.amount).label('total'),
            func.count(Transaction.id).label('count')
        ).filter(Transaction.user_id == user_id, Transaction.amount > 0)
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        results = query.group_by(Transaction.category).all()
        
        return [
            {
                "category": r.category or "uncategorized",
                "total": round(float(r.total), 2),
                "count": r.count
            }
            for r in results
        ]

    @staticmethod
    def get_monthly_trend(db: Session, user_id: int, months: int = 6) -> List[Dict]:
        """
        Get monthly spending trend
        
        Args:
            db: Database session
            months: Number of months to include
            
        Returns:
            List of monthly summaries
        """
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)
        
        query = db.query(
            extract('year', Transaction.date).label('year'),
            extract('month', Transaction.date).label('month'),
            func.sum(Transaction.amount).label('total'),
            func.count(Transaction.id).label('count')
        ).filter(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.amount > 0
        ).group_by('year', 'month').order_by('year', 'month')
        
        results = query.all()
        
        return [
            {
                "year": int(r.year),
                "month": int(r.month),
                "total": round(float(r.total), 2),
                "count": r.count
            }
            for r in results
        ]

    @staticmethod
    def export_to_csv(db: Session, user_id: int, start_date: datetime = None, end_date: datetime = None) -> str:
        """
        Export transactions to CSV format
        
        Args:
            db: Database session
            start_date: Start date for filtering
            end_date: End date for filtering
            
        Returns:
            CSV string
        """
        query = db.query(Transaction).filter(Transaction.user_id == user_id)
        
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        transactions = query.all()
        
        # Convert to pandas DataFrame
        data = [
            {
                "Date": t.date.strftime("%Y-%m-%d") if t.date else "",
                "Vendor": t.vendor or "",
                "Amount": t.amount,
                "Category": t.category or "",
                "Description": t.description or ""
            }
            for t in transactions
        ]
        
        df = pd.DataFrame(data)
        return df.to_csv(index=False)
