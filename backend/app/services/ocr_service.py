import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
import logging
import cv2
import numpy as np
from app.services.document_scanner import DocumentScanner

logger = logging.getLogger(__name__)


class OCRService:
    """Service for extracting text from images and PDFs using Tesseract OCR with OpenCV preprocessing"""
    
    def __init__(self):
        # Configure Tesseract path if needed (for Windows/Mac)
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'
        self.scanner = DocumentScanner()

    def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from an image file with OpenCV preprocessing
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Extracted text as string
        """
        try:
            # Preprocess image with OpenCV
            processed_image = self.scanner.scan_document(image_path)
            
            if processed_image is not None:
                # Convert OpenCV image to PIL Image for Tesseract
                if len(processed_image.shape) == 2:  # Grayscale
                    pil_image = Image.fromarray(processed_image)
                else:  # Color
                    pil_image = Image.fromarray(cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB))
            else:
                # Fallback to original image if preprocessing fails
                pil_image = Image.open(image_path)
            
            # Perform OCR with custom config for better accuracy
            custom_config = r'--oem 3 --psm 6'  # LSTM OCR Engine, assume uniform block of text
            text = pytesseract.image_to_string(pil_image, config=custom_config)
            
            # Also try with different PSM modes if first attempt yields little text
            if len(text.strip()) < 50:
                custom_config = r'--oem 3 --psm 3'  # Fully automatic page segmentation
                text = pytesseract.image_to_string(pil_image, config=custom_config)
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            # Fallback to basic OCR without preprocessing
            try:
                image = Image.open(image_path)
                return pytesseract.image_to_string(image).strip()
            except:
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
            logger.error(f"Error extracting text from PDF: {str(e)}")
            return ""

    def extract_text(self, file_path: str) -> str:
        """
        Extract text from any supported file type with advanced preprocessing
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text as string
        """
        if not os.path.exists(file_path):
            return ""
        
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif file_extension in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp']:
            return self.extract_text_from_image(file_path)
        else:
            logger.warning(f"Unsupported file type: {file_extension}")
            return ""
    
    def get_document_confidence(self, image_path: str) -> float:
        """
        Get OCR confidence score for the document
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Confidence score (0-100)
        """
        try:
            image = Image.open(image_path)
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            confidences = [int(conf) for conf in data['conf'] if conf != '-1']
            
            if confidences:
                return sum(confidences) / len(confidences)
            return 0.0
            
        except Exception as e:
            logger.error(f"Error calculating confidence: {str(e)}")
            return 0.0
