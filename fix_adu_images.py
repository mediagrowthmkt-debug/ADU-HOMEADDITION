#!/usr/bin/env python3
"""
Script to fix image orientation and regenerate WebP files
"""

import os
from PIL import Image, ExifTags
import sys

def fix_and_save_image(image_path, output_webp_path):
    """
    Fix the orientation of an image and save as WebP
    """
    try:
        image = Image.open(image_path)
        
        # Check if image has EXIF data
        try:
            exif = image._getexif()
            if exif is not None:
                # Find the orientation tag
                for orientation_key in ExifTags.TAGS.keys():
                    if ExifTags.TAGS[orientation_key] == 'Orientation':
                        break
                
                if orientation_key in exif:
                    orientation = exif[orientation_key]
                    
                    # Rotate image based on orientation
                    if orientation == 3:
                        image = image.rotate(180, expand=True)
                        print(f"  Rotated 180°")
                    elif orientation == 6:
                        image = image.rotate(270, expand=True)
                        print(f"  Rotated 270° (correcting 90° CW)")
                    elif orientation == 8:
                        image = image.rotate(90, expand=True)
                        print(f"  Rotated 90° (correcting 270° CW)")
        except (AttributeError, KeyError, IndexError):
            pass
        
        # Save as WebP without EXIF
        image.save(output_webp_path, 'WEBP', quality=90)
        print(f"  ✓ Saved to {os.path.basename(output_webp_path)}")
        return True
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    # Paths
    images_dir = "images"
    output_dir = "addition photos"
    
    if not os.path.exists(images_dir):
        print(f"Directory '{images_dir}' not found!")
        sys.exit(1)
    
    if not os.path.exists(output_dir):
        print(f"Directory '{output_dir}' not found!")
        sys.exit(1)
    
    # List of images that need fixing based on our check
    images_to_fix = [
        "1.jpg",
        "2.jpg",
        "3.jpg",
        "20250403_140244.jpg",
        "20250405_081552.jpg",
        "20250418_121017.jpg",
        "20250429_121406.jpg",
        "20250503_122937.jpg",
        "20250503_123003.jpg"
    ]
    
    print("Fixing image orientations and regenerating WebP files...")
    print("=" * 70)
    
    fixed_count = 0
    
    for filename in images_to_fix:
        input_path = os.path.join(images_dir, filename)
        output_filename = filename.rsplit('.', 1)[0] + '.webp'
        output_path = os.path.join(output_dir, output_filename)
        
        print(f"\nProcessing {filename}...")
        
        if not os.path.exists(input_path):
            print(f"  ✗ Source file not found!")
            continue
        
        if fix_and_save_image(input_path, output_path):
            fixed_count += 1
    
    print("\n" + "=" * 70)
    print(f"Fixed and regenerated {fixed_count} out of {len(images_to_fix)} images")
    print("\nPlease refresh your browser to see the corrected images!")

if __name__ == "__main__":
    main()
