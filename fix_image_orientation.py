#!/usr/bin/env python3
"""
Script to fix image orientation based on EXIF data
"""

import os
from PIL import Image, ExifTags
import sys

def fix_image_orientation(image_path):
    """
    Fix the orientation of an image based on its EXIF data
    """
    try:
        image = Image.open(image_path)
        
        # Check if image has EXIF data
        try:
            exif = image._getexif()
            if exif is None:
                print(f"No EXIF data found in {os.path.basename(image_path)}")
                return False
                
            # Find the orientation tag
            for orientation_key in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation_key] == 'Orientation':
                    break
            
            if orientation_key not in exif:
                print(f"No orientation tag in {os.path.basename(image_path)}")
                return False
                
            orientation = exif[orientation_key]
            
            # Rotate image based on orientation
            if orientation == 3:
                image = image.rotate(180, expand=True)
                print(f"Rotated 180° {os.path.basename(image_path)}")
            elif orientation == 6:
                image = image.rotate(270, expand=True)
                print(f"Rotated 270° (90° CCW) {os.path.basename(image_path)}")
            elif orientation == 8:
                image = image.rotate(90, expand=True)
                print(f"Rotated 90° (270° CCW) {os.path.basename(image_path)}")
            else:
                print(f"Orientation {orientation} - no rotation needed for {os.path.basename(image_path)}")
                return False
            
            # Save the corrected image without EXIF data
            # For WebP, we need to handle it differently
            if image_path.lower().endswith('.webp'):
                image.save(image_path, 'WEBP', quality=90, exif=b'')
            else:
                image.save(image_path, quality=95, exif=b'')
            
            print(f"✓ Fixed orientation for {os.path.basename(image_path)}")
            return True
            
        except (AttributeError, KeyError, IndexError) as e:
            print(f"Error reading EXIF data from {os.path.basename(image_path)}: {e}")
            return False
            
    except Exception as e:
        print(f"Error processing {os.path.basename(image_path)}: {e}")
        return False

def main():
    # Path to the addition photos directory
    photos_dir = "addition photos"
    
    if not os.path.exists(photos_dir):
        print(f"Directory '{photos_dir}' not found!")
        sys.exit(1)
    
    print(f"Scanning {photos_dir} for images to fix...")
    print("=" * 60)
    
    fixed_count = 0
    total_images = 0
    
    # Process all image files
    for filename in os.listdir(photos_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            total_images += 1
            image_path = os.path.join(photos_dir, filename)
            if fix_image_orientation(image_path):
                fixed_count += 1
            print("-" * 60)
    
    print("=" * 60)
    print(f"\nSummary:")
    print(f"Total images processed: {total_images}")
    print(f"Images fixed: {fixed_count}")
    print(f"Images skipped: {total_images - fixed_count}")

if __name__ == "__main__":
    main()
