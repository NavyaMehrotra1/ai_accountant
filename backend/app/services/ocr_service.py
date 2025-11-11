import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
from typing import Optional


class OCRService:
    """Service for extracting text from images and PDFs using OCR"""

    def __init__(self):
        # Configure tesseract path if needed (uncomment for macOS with homebrew)
        # pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'
        pass

    def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from an image file using Tesseract OCR
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Extracted text as string
        """
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            return ""

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from a PDF file by converting to images first
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Extracted text as string
        """
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            # Extract text from each page
            full_text = []
            for i, image in enumerate(images):
                text = pytesseract.image_to_string(image)
                full_text.append(f"--- Page {i+1} ---\n{text}")
            
            return "\n\n".join(full_text).strip()
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return ""

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from a file (auto-detects PDF or image)
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text as string
        """
        if not os.path.exists(file_path):
            return ""
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']:
            return self.extract_text_from_image(file_path)
        else:
            return ""
