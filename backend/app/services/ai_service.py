from openai import OpenAI
import os
import json
from typing import Dict, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class AIService:
    """Service for AI-powered document analysis using OpenAI"""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print("Warning: OPENAI_API_KEY not set. AI features will be disabled.")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)

    def parse_receipt(self, text: str) -> Dict:
        """
        Parse receipt/invoice text and extract structured data
        
        Args:
            text: Raw text extracted from document
            
        Returns:
            Dictionary with extracted fields
        """
        if not self.client:
            return self._fallback_parse(text)

        try:
            prompt = f"""Analyze this receipt/invoice text and extract the following information in JSON format:
- date (ISO format YYYY-MM-DD, or null if not found)
- amount (numeric value only, no currency symbols)
- vendor (business/store name)
- category (one of: meals, travel, office_supplies, utilities, entertainment, healthcare, other)
- description (brief summary of the transaction)

Receipt text:
{text}

Respond ONLY with valid JSON, no other text."""

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a financial document analyzer. Extract structured data from receipts and invoices. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )

            result = response.choices[0].message.content.strip()
            
            # Parse JSON response
            data = json.loads(result)
            
            # Validate and clean data
            return {
                "date": data.get("date"),
                "amount": float(data.get("amount", 0)) if data.get("amount") else None,
                "vendor": data.get("vendor", "Unknown"),
                "category": data.get("category", "other"),
                "description": data.get("description", "")
            }

        except Exception as e:
            print(f"Error parsing with AI: {e}")
            return self._fallback_parse(text)

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
        if not self.client:
            return "other"

        try:
            prompt = f"""Categorize this transaction into ONE of these categories:
meals, travel, office_supplies, utilities, entertainment, healthcare, other

Vendor: {vendor}
Description: {description}

Respond with ONLY the category name, nothing else."""

            response = self.client.chat.completions.create(
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
            print(f"Error categorizing: {e}")
            return "other"
