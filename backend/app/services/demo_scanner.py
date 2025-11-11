import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
from app.services.document_scanner import DocumentScanner

class DemoScanner:
    """Create visual demonstrations of OpenCV document scanning"""
    
    def __init__(self):
        self.scanner = DocumentScanner()
    
    def create_sample_receipt(self, output_path: str):
        """
        Create a sample receipt image for demonstration
        
        Args:
            output_path: Path to save the sample receipt
        """
        # Create a white image
        img = Image.new('RGB', (800, 1000), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a nice font, fallback to default
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
            header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
            body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
        except:
            title_font = ImageFont.load_default()
            header_font = ImageFont.load_default()
            body_font = ImageFont.load_default()
        
        # Draw receipt header
        draw.text((250, 50), "ACME STORE", fill='black', font=title_font)
        draw.text((200, 100), "123 Main Street", fill='black', font=body_font)
        draw.text((250, 130), "City, ST 12345", fill='black', font=body_font)
        draw.text((280, 160), "(555) 123-4567", fill='black', font=body_font)
        
        # Draw line
        draw.line([(50, 200), (750, 200)], fill='black', width=2)
        
        # Receipt details
        y = 240
        draw.text((50, y), "Date: 11/10/2025", fill='black', font=body_font)
        y += 40
        draw.text((50, y), "Time: 14:35:22", fill='black', font=body_font)
        y += 40
        draw.text((50, y), "Receipt #: 12345", fill='black', font=body_font)
        
        # Draw line
        y += 40
        draw.line([(50, y), (750, y)], fill='black', width=2)
        
        # Items
        y += 40
        draw.text((50, y), "ITEMS", fill='black', font=header_font)
        y += 50
        
        items = [
            ("Office Supplies", "29.99"),
            ("Printer Paper (5 reams)", "45.00"),
            ("Pens (Box of 50)", "12.50"),
            ("Notebooks (Pack of 10)", "18.75"),
            ("Desk Organizer", "34.99"),
        ]
        
        for item, price in items:
            draw.text((50, y), item, fill='black', font=body_font)
            draw.text((650, y), f"${price}", fill='black', font=body_font)
            y += 35
        
        # Draw line
        y += 20
        draw.line([(50, y), (750, y)], fill='black', width=2)
        
        # Totals
        y += 30
        draw.text((450, y), "Subtotal:", fill='black', font=body_font)
        draw.text((650, y), "$141.23", fill='black', font=body_font)
        y += 35
        draw.text((450, y), "Tax (8.5%):", fill='black', font=body_font)
        draw.text((650, y), "$12.00", fill='black', font=body_font)
        y += 35
        draw.text((450, y), "TOTAL:", fill='black', font=header_font)
        draw.text((650, y), "$153.23", fill='black', font=header_font)
        
        # Draw line
        y += 40
        draw.line([(50, y), (750, y)], fill='black', width=2)
        
        # Payment info
        y += 30
        draw.text((50, y), "Payment Method: Credit Card", fill='black', font=body_font)
        y += 35
        draw.text((50, y), "Card: **** **** **** 4532", fill='black', font=body_font)
        
        # Footer
        y += 80
        draw.text((200, y), "Thank you for shopping!", fill='black', font=body_font)
        y += 35
        draw.text((150, y), "Visit us at www.acmestore.com", fill='black', font=body_font)
        
        # Save
        img.save(output_path)
        return output_path
    
    def create_demo_images(self, base_path: str = "./demo_images"):
        """
        Create a complete set of demo images showing OpenCV processing
        
        Args:
            base_path: Directory to save demo images
        """
        os.makedirs(base_path, exist_ok=True)
        
        # Create sample receipt
        receipt_path = os.path.join(base_path, "01_original_receipt.png")
        self.create_sample_receipt(receipt_path)
        
        # Load the receipt
        img = cv2.imread(receipt_path)
        
        # 1. Save original
        cv2.imwrite(os.path.join(base_path, "01_original.jpg"), img)
        
        # 2. Create angled version (simulate phone photo)
        angled = self.create_angled_document(img)
        cv2.imwrite(os.path.join(base_path, "02_angled_photo.jpg"), angled)
        
        # 3. Add shadow
        shadowed = self.add_shadow(angled)
        cv2.imwrite(os.path.join(base_path, "03_with_shadow.jpg"), shadowed)
        
        # 4. Add background
        with_bg = self.add_background(shadowed)
        cv2.imwrite(os.path.join(base_path, "04_cluttered_background.jpg"), with_bg)
        
        # 5. Detect edges
        gray = cv2.cvtColor(with_bg, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edged = cv2.Canny(blurred, 75, 200)
        cv2.imwrite(os.path.join(base_path, "05_edge_detection.jpg"), edged)
        
        # 6. Process with scanner
        scanned = self.scanner.scan_document(os.path.join(base_path, "04_cluttered_background.jpg"))
        if scanned is not None:
            cv2.imwrite(os.path.join(base_path, "06_scanned_corrected.jpg"), scanned)
        
        # 7. Enhanced version
        if scanned is not None:
            enhanced = self.scanner.enhance_document(cv2.imread(os.path.join(base_path, "06_scanned_corrected.jpg")))
            cv2.imwrite(os.path.join(base_path, "07_enhanced_final.jpg"), enhanced)
        
        return base_path
    
    def create_angled_document(self, img: np.ndarray, angle: float = 25) -> np.ndarray:
        """
        Create an angled/tilted version of the document
        
        Args:
            img: Input image
            angle: Rotation angle in degrees
            
        Returns:
            Angled image
        """
        h, w = img.shape[:2]
        
        # Get rotation matrix
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        
        # Calculate new dimensions
        cos = np.abs(M[0, 0])
        sin = np.abs(M[0, 1])
        new_w = int((h * sin) + (w * cos))
        new_h = int((h * cos) + (w * sin))
        
        # Adjust rotation matrix
        M[0, 2] += (new_w / 2) - center[0]
        M[1, 2] += (new_h / 2) - center[1]
        
        # Rotate
        rotated = cv2.warpAffine(img, M, (new_w, new_h), 
                                 borderMode=cv2.BORDER_CONSTANT, 
                                 borderValue=(240, 240, 240))
        
        return rotated
    
    def add_shadow(self, img: np.ndarray) -> np.ndarray:
        """
        Add a shadow effect to simulate real-world conditions
        
        Args:
            img: Input image
            
        Returns:
            Image with shadow
        """
        h, w = img.shape[:2]
        
        # Create gradient mask
        mask = np.zeros((h, w), dtype=np.float32)
        for i in range(h):
            mask[i, :] = 1.0 - (i / h) * 0.4
        
        # Apply mask
        result = img.copy().astype(np.float32)
        for c in range(3):
            result[:, :, c] = result[:, :, c] * mask
        
        return np.clip(result, 0, 255).astype(np.uint8)
    
    def add_background(self, img: np.ndarray) -> np.ndarray:
        """
        Add a cluttered background to simulate real photo
        
        Args:
            img: Input image
            
        Returns:
            Image with background
        """
        h, w = img.shape[:2]
        
        # Create larger canvas with textured background
        canvas_h, canvas_w = h + 400, w + 400
        canvas = np.random.randint(100, 180, (canvas_h, canvas_w, 3), dtype=np.uint8)
        
        # Add some noise/texture
        noise = np.random.randint(-30, 30, (canvas_h, canvas_w, 3), dtype=np.int16)
        canvas = np.clip(canvas.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        
        # Place document on canvas
        y_offset = 200
        x_offset = 200
        
        # Blend document onto background
        canvas[y_offset:y_offset+h, x_offset:x_offset+w] = img
        
        return canvas
    
    def create_comparison_image(self, original_path: str, processed_path: str, output_path: str):
        """
        Create side-by-side comparison image
        
        Args:
            original_path: Path to original image
            processed_path: Path to processed image
            output_path: Path to save comparison
        """
        # Load images
        orig = cv2.imread(original_path)
        proc = cv2.imread(processed_path)
        
        # Resize to same height
        h = min(orig.shape[0], proc.shape[0])
        orig = cv2.resize(orig, (int(orig.shape[1] * h / orig.shape[0]), h))
        proc = cv2.resize(proc, (int(proc.shape[1] * h / proc.shape[0]), h))
        
        # Add labels
        cv2.putText(orig, "BEFORE", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 
                   2, (0, 0, 255), 3)
        cv2.putText(proc, "AFTER", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 
                   2, (0, 255, 0), 3)
        
        # Concatenate
        comparison = np.hstack([orig, proc])
        
        # Save
        cv2.imwrite(output_path, comparison)
        return output_path


def generate_demo_samples():
    """Generate all demo samples"""
    demo = DemoScanner()
    demo_path = demo.create_demo_images()
    
    # Create comparison images
    demo.create_comparison_image(
        os.path.join(demo_path, "04_cluttered_background.jpg"),
        os.path.join(demo_path, "07_enhanced_final.jpg"),
        os.path.join(demo_path, "08_comparison.jpg")
    )
    
    return demo_path


if __name__ == "__main__":
    print("Generating OpenCV demo samples...")
    path = generate_demo_samples()
    print(f"Demo images saved to: {path}")
