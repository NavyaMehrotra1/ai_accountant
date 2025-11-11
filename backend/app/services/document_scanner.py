import cv2
import numpy as np
from PIL import Image
import imutils
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class DocumentScanner:
    """Advanced document scanning and preprocessing using OpenCV"""
    
    def __init__(self):
        self.min_contour_area = 10000  # Minimum area for document detection
        
    def scan_document(self, image_path: str) -> Optional[np.ndarray]:
        """
        Main scanning pipeline: detect, crop, and enhance document
        
        Args:
            image_path: Path to the input image
            
        Returns:
            Processed image as numpy array, or None if processing fails
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to load image: {image_path}")
                return None
            
            # Resize for faster processing
            orig = image.copy()
            ratio = image.shape[0] / 500.0
            image = imutils.resize(image, height=500)
            
            # Detect document edges
            contour = self.detect_document_edges(image)
            
            if contour is not None:
                # Apply perspective transform
                warped = self.four_point_transform(orig, contour.reshape(4, 2) * ratio)
            else:
                # If no document detected, use original
                logger.warning("Document edges not detected, using original image")
                warped = orig
            
            # Enhance the image
            enhanced = self.enhance_document(warped)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Error scanning document: {str(e)}")
            return None
    
    def detect_document_edges(self, image: np.ndarray) -> Optional[np.ndarray]:
        """
        Detect document edges using contour detection
        
        Args:
            image: Input image
            
        Returns:
            Contour of document edges, or None if not found
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Edge detection
        edged = cv2.Canny(blurred, 75, 200)
        
        # Find contours
        contours = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        contours = imutils.grab_contours(contours)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
        
        # Find the largest 4-sided contour (document)
        for contour in contours:
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
            
            if len(approx) == 4 and cv2.contourArea(contour) > self.min_contour_area:
                return approx
        
        return None
    
    def four_point_transform(self, image: np.ndarray, pts: np.ndarray) -> np.ndarray:
        """
        Apply perspective transform to get bird's eye view of document
        
        Args:
            image: Input image
            pts: Four corner points of the document
            
        Returns:
            Warped image
        """
        # Order points: top-left, top-right, bottom-right, bottom-left
        rect = self.order_points(pts)
        (tl, tr, br, bl) = rect
        
        # Calculate width of new image
        widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
        widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
        maxWidth = max(int(widthA), int(widthB))
        
        # Calculate height of new image
        heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
        heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
        maxHeight = max(int(heightA), int(heightB))
        
        # Destination points for perspective transform
        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype="float32")
        
        # Calculate perspective transform matrix and apply it
        M = cv2.getPerspectiveTransform(rect, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
        
        return warped
    
    def order_points(self, pts: np.ndarray) -> np.ndarray:
        """
        Order points in clockwise order: top-left, top-right, bottom-right, bottom-left
        
        Args:
            pts: Four corner points
            
        Returns:
            Ordered points
        """
        rect = np.zeros((4, 2), dtype="float32")
        
        # Sum and difference to find corners
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # Top-left
        rect[2] = pts[np.argmax(s)]  # Bottom-right
        
        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]  # Top-right
        rect[3] = pts[np.argmax(diff)]  # Bottom-left
        
        return rect
    
    def enhance_document(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance document image for better OCR
        
        Args:
            image: Input image
            
        Returns:
            Enhanced image
        """
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
        
        # Sharpen
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(denoised, -1, kernel)
        
        return sharpened
    
    def deskew_image(self, image: np.ndarray) -> np.ndarray:
        """
        Correct skew/rotation in document
        
        Args:
            image: Input image
            
        Returns:
            Deskewed image
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Detect edges
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        
        # Detect lines using Hough transform
        lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
        
        if lines is not None:
            # Calculate average angle
            angles = []
            for rho, theta in lines[:, 0]:
                angle = np.degrees(theta) - 90
                angles.append(angle)
            
            median_angle = np.median(angles)
            
            # Rotate image
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, median_angle, 1.0)
            rotated = cv2.warpAffine(image, M, (w, h), 
                                    flags=cv2.INTER_CUBIC, 
                                    borderMode=cv2.BORDER_REPLICATE)
            return rotated
        
        return image
    
    def remove_shadows(self, image: np.ndarray) -> np.ndarray:
        """
        Remove shadows from document image
        
        Args:
            image: Input image
            
        Returns:
            Image with shadows removed
        """
        # Convert to LAB color space
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        
        # Merge channels
        limg = cv2.merge((cl, a, b))
        
        # Convert back to BGR
        enhanced = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        return enhanced
    
    def process_receipt(self, image_path: str, output_path: str) -> bool:
        """
        Complete receipt processing pipeline
        
        Args:
            image_path: Path to input image
            output_path: Path to save processed image
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                return False
            
            # Remove shadows
            no_shadows = self.remove_shadows(image)
            
            # Scan document
            scanned = self.scan_document(image_path)
            if scanned is None:
                scanned = no_shadows
            
            # Deskew
            deskewed = self.deskew_image(scanned)
            
            # Save processed image
            cv2.imwrite(output_path, deskewed)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing receipt: {str(e)}")
            return False
