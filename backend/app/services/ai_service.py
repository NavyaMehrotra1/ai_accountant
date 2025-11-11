from openai import OpenAI
import anthropic
import os
import json
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered document analysis using OpenAI and Claude AI"""

    def __init__(self):
        # OpenAI for quick categorization
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            logger.warning("OPENAI_API_KEY not set. Some AI features will be disabled.")
            self.openai_client = None
        else:
            self.openai_client = OpenAI(api_key=openai_key)
        
        # Claude for advanced analysis
        claude_key = os.getenv("ANTHROPIC_API_KEY")
        if not claude_key:
            logger.warning("ANTHROPIC_API_KEY not set. Advanced AI features will be disabled.")
            self.claude_client = None
        else:
            self.claude_client = anthropic.Anthropic(api_key=claude_key)

    def parse_receipt(self, text: str) -> Dict:
        """
        Parse receipt/invoice text and extract structured data using Claude AI
        
        Args:
            text: Raw text extracted from document
            
        Returns:
            Dictionary with extracted fields
        """
        # Use Claude for better document understanding
        if self.claude_client:
            try:
                return self._parse_with_claude(text)
            except Exception as e:
                logger.error(f"Claude parsing failed: {e}")
        
        # Fallback to OpenAI
        if self.openai_client:
            try:
                return self._parse_with_openai(text)
            except Exception as e:
                logger.error(f"OpenAI parsing failed: {e}")
        
        return self._fallback_parse(text)
    
    def _parse_with_claude(self, text: str) -> Dict:
        """Parse receipt using Claude AI for superior accuracy"""
        prompt = f"""Analyze this receipt/invoice and extract structured data.

Receipt text:
{text}

Extract the following in JSON format:
- date: ISO format YYYY-MM-DD (or null)
- amount: numeric value only
- vendor: business name
- category: one of [meals, travel, office_supplies, utilities, entertainment, healthcare, other]
- description: brief summary
- line_items: array of items purchased (if available)
- tax_amount: tax amount (if shown)
- payment_method: payment method (if shown)

Respond with ONLY valid JSON."""

        message = self.claude_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        result = message.content[0].text.strip()
        data = json.loads(result)
        
        return {
            "date": data.get("date"),
            "amount": float(data.get("amount", 0)) if data.get("amount") else None,
            "vendor": data.get("vendor", "Unknown"),
            "category": data.get("category", "other"),
            "description": data.get("description", ""),
            "line_items": data.get("line_items", []),
            "tax_amount": data.get("tax_amount"),
            "payment_method": data.get("payment_method")
        }
    
    def _parse_with_openai(self, text: str) -> Dict:
        """Parse receipt using OpenAI as fallback"""
        prompt = f"""Analyze this receipt/invoice text and extract the following information in JSON format:
- date (ISO format YYYY-MM-DD, or null if not found)
- amount (numeric value only, no currency symbols)
- vendor (business/store name)
- category (one of: meals, travel, office_supplies, utilities, entertainment, healthcare, other)
- description (brief summary of the transaction)

Receipt text:
{text}

Respond ONLY with valid JSON, no other text."""

        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a financial document analyzer. Extract structured data from receipts and invoices. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=500
        )

        result = response.choices[0].message.content.strip()
        data = json.loads(result)
        
        return {
            "date": data.get("date"),
            "amount": float(data.get("amount", 0)) if data.get("amount") else None,
            "vendor": data.get("vendor", "Unknown"),
            "category": data.get("category", "other"),
            "description": data.get("description", "")
        }

    def _fallback_parse(self, text: str) -> Dict:
        """
        Fallback parsing when AI is not available
        Uses simple heuristics to extract basic information
        """
        import re
        
        # Try to find amount (look for currency patterns)
        amount_pattern = r'\$?\s*(\d+\.\d{2})'
        amounts = re.findall(amount_pattern, text)
        amount = float(amounts[-1]) if amounts else None
        
        # Try to find date
        date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})'
        dates = re.findall(date_pattern, text)
        date_str = dates[0] if dates else None
        
        # Extract first line as potential vendor
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        vendor = lines[0] if lines else "Unknown"
        
        return {
            "date": date_str,
            "amount": amount,
            "vendor": vendor[:100],  # Limit length
            "category": "other",
            "description": text[:200]  # First 200 chars
        }

    def categorize_transaction(self, vendor: str, description: str) -> str:
        """
        Categorize a transaction based on vendor and description
        
        Args:
            vendor: Vendor name
            description: Transaction description
            
        Returns:
            Category string
        """
        if not self.openai_client:
            return "other"

        try:
            prompt = f"""Categorize this transaction into ONE of these categories:
meals, travel, office_supplies, utilities, entertainment, healthcare, other

Vendor: {vendor}
Description: {description}

Respond with ONLY the category name, nothing else."""

            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a transaction categorizer. Respond with only the category name."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=20
            )

            category = response.choices[0].message.content.strip().lower()
            return category if category in ["meals", "travel", "office_supplies", "utilities", "entertainment", "healthcare"] else "other"

        except Exception as e:
            logger.error(f"Error categorizing: {e}")
            return "other"
    
    def detect_anomalies(self, transactions: List[Dict]) -> List[Dict]:
        """
        Detect unusual spending patterns and potential fraud using Claude AI
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            List of anomalies with explanations
        """
        if not self.claude_client or not transactions:
            return []
        
        try:
            # Prepare transaction summary
            tx_summary = json.dumps([
                {
                    "date": tx.get("date"),
                    "vendor": tx.get("vendor"),
                    "amount": tx.get("amount"),
                    "category": tx.get("category")
                }
                for tx in transactions[-100:]  # Last 100 transactions
            ], indent=2)
            
            prompt = f"""Analyze these financial transactions and identify any anomalies, unusual patterns, or potential issues.

Transactions:
{tx_summary}

Look for:
1. Unusually large amounts compared to typical spending
2. Duplicate transactions (same vendor, amount, date)
3. Suspicious vendors or categories
4. Unusual spending patterns or frequency
5. Potential fraudulent activity

Respond with JSON array of anomalies:
[
  {{
    "type": "duplicate|unusual_amount|suspicious_vendor|pattern_change",
    "severity": "low|medium|high",
    "description": "explanation",
    "transactions": ["vendor names or dates involved"],
    "recommendation": "what to do"
  }}
]

If no anomalies found, return empty array []."""

            message = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = message.content[0].text.strip()
            anomalies = json.loads(result)
            return anomalies if isinstance(anomalies, list) else []
            
        except Exception as e:
            logger.error(f"Error detecting anomalies: {e}")
            return []
    
    def generate_financial_insights(self, transactions: List[Dict], summary: Dict) -> Dict:
        """
        Generate intelligent financial insights and recommendations using Claude AI
        
        Args:
            transactions: List of recent transactions
            summary: Financial summary data
            
        Returns:
            Dictionary with insights and recommendations
        """
        if not self.claude_client:
            return {"insights": [], "recommendations": []}
        
        try:
            context = f"""Financial Summary:
- Total Income: ${summary.get('total_income', 0):,.2f}
- Total Expenses: ${summary.get('total_expenses', 0):,.2f}
- Net: ${summary.get('net', 0):,.2f}
- Transaction Count: {summary.get('transaction_count', 0)}

Category Breakdown:
{json.dumps(summary.get('by_category', {}), indent=2)}

Recent Transactions (sample):
{json.dumps([{"vendor": tx.get("vendor"), "amount": tx.get("amount"), "category": tx.get("category")} for tx in transactions[-20:]], indent=2)}"""

            prompt = f"""{context}

As a financial advisor AI, provide:

1. **Key Insights** (3-5 observations about spending patterns)
2. **Recommendations** (3-5 actionable suggestions to improve financial health)
3. **Opportunities** (potential savings or optimizations)
4. **Warnings** (any concerning trends)

Respond in JSON format:
{{
  "insights": [
    {{
      "title": "insight title",
      "description": "detailed explanation",
      "impact": "high|medium|low"
    }}
  ],
  "recommendations": [
    {{
      "title": "recommendation title",
      "description": "what to do",
      "potential_savings": "estimated amount or null",
      "priority": "high|medium|low"
    }}
  ],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "warnings": ["warning 1", "warning 2"]
}}"""

            message = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = message.content[0].text.strip()
            return json.loads(result)
            
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return {"insights": [], "recommendations": []}
    
    def find_tax_deductions(self, transactions: List[Dict], account_type: str = "individual") -> Dict:
        """
        Identify potential tax deductions using Claude AI
        
        Args:
            transactions: List of transactions
            account_type: 'individual' or 'company'
            
        Returns:
            Dictionary with potential deductions
        """
        if not self.claude_client or not transactions:
            return {"deductions": [], "total_potential": 0}
        
        try:
            tx_data = json.dumps([
                {
                    "date": tx.get("date"),
                    "vendor": tx.get("vendor"),
                    "amount": tx.get("amount"),
                    "category": tx.get("category"),
                    "description": tx.get("description")
                }
                for tx in transactions
            ], indent=2)
            
            tax_context = "business" if account_type == "company" else "personal"
            
            prompt = f"""Analyze these transactions for potential tax deductions ({tax_context} tax context).

Transactions:
{tx_data}

Identify:
1. Deductible expenses based on category and description
2. Home office expenses
3. Business travel and meals (if applicable)
4. Professional development
5. Healthcare expenses
6. Charitable donations
7. Other relevant deductions

Respond in JSON:
{{
  "deductions": [
    {{
      "category": "deduction category",
      "description": "what qualifies",
      "amount": total_amount,
      "transaction_count": count,
      "confidence": "high|medium|low",
      "notes": "important details or requirements"
    }}
  ],
  "total_potential": sum_of_all_deductions,
  "disclaimer": "consult tax professional message"
}}"""

            message = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = message.content[0].text.strip()
            return json.loads(result)
            
        except Exception as e:
            logger.error(f"Error finding tax deductions: {e}")
            return {"deductions": [], "total_potential": 0}
    
    def forecast_spending(self, transactions: List[Dict], months_ahead: int = 3) -> Dict:
        """
        Forecast future spending using Claude AI
        
        Args:
            transactions: Historical transactions
            months_ahead: Number of months to forecast
            
        Returns:
            Forecast data with predictions
        """
        if not self.claude_client or not transactions:
            return {"forecast": [], "confidence": "low"}
        
        try:
            # Group by month
            monthly_data = {}
            for tx in transactions:
                if tx.get("date"):
                    month = tx["date"][:7]  # YYYY-MM
                    if month not in monthly_data:
                        monthly_data[month] = {"total": 0, "by_category": {}}
                    monthly_data[month]["total"] += tx.get("amount", 0)
                    category = tx.get("category", "other")
                    monthly_data[month]["by_category"][category] = monthly_data[month]["by_category"].get(category, 0) + tx.get("amount", 0)
            
            prompt = f"""Analyze this historical spending data and forecast the next {months_ahead} months.

Historical Data:
{json.dumps(monthly_data, indent=2)}

Provide:
1. Monthly spending forecast
2. Category-wise predictions
3. Confidence level
4. Trends and seasonality

Respond in JSON:
{{
  "forecast": [
    {{
      "month": "YYYY-MM",
      "predicted_total": amount,
      "by_category": {{"category": amount}},
      "confidence": "high|medium|low"
    }}
  ],
  "trends": ["trend 1", "trend 2"],
  "seasonality": "description of seasonal patterns",
  "overall_confidence": "high|medium|low"
}}"""

            message = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result = message.content[0].text.strip()
            return json.loads(result)
            
        except Exception as e:
            logger.error(f"Error forecasting: {e}")
            return {"forecast": [], "confidence": "low"}
