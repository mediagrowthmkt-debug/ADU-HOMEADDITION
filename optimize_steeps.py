#!/usr/bin/env python3
"""
Script to optimize steeps images and check orientation
"""

import os
from PIL import Image, ExifTags

def fix_and_optimize_image(input_path, output_path):
    """
    Fix orientation and optimize image
    """
    try:
        image = Image.open(input_path)
        
        # Check and fix EXIF orientation
        try:
            exif = image._getexif()
            if exif is not None:
                for orientation_key in ExifTags.TAGS.keys():
                    if ExifTags.TAGS[orientation_key] == 'Orientation':
                        break
                
                if orientation_key in exif:
                    orientation = exif[orientation_key]
                    
                    if orientation == 3:
                        image = image.rotate(180, expand=True)
                        print(f"  Rotated 180°")
                    elif orientation == 6:
                        image = image.rotate(270, expand=True)
                        print(f"  Rotated 270° (correcting 90° CW)")
                    elif orientation == 8:
                        image = image.rotate(90, expand=True)
                        print(f"  Rotated 90°")
        except (AttributeError, KeyError, IndexError):
            pass
        
        # Save as WebP with optimization
        image.save(output_path, 'WEBP', quality=85)
        
        # Get file sizes
        original_size = os.path.getsize(input_path) / 1024 / 1024
        new_size = os.path.getsize(output_path) / 1024 / 1024
        savings = ((original_size - new_size) / original_size) * 100
        
        print(f"  ✓ Optimized: {original_size:.2f}MB → {new_size:.2f}MB (saved {savings:.1f}%)")
        return True
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    steeps_dir = "steeps"
    
    if not os.path.exists(steeps_dir):
        print(f"Directory '{steeps_dir}' not found!")
        return
    
    print("Optimizing steeps images...")
    print("=" * 70)
    
    images = [
        ("1.jpg", "step-1-foundation.webp"),
        ("2.jpg", "step-2-framing.webp"),
        ("3.jpg", "step-3-sheathing.webp"),
        ("final adu.jpg", "step-4-complete.webp")
    ]
    
    for input_file, output_file in images:
        input_path = os.path.join(steeps_dir, input_file)
        output_path = os.path.join(steeps_dir, output_file)
        
        print(f"\nProcessing {input_file}...")
        
        if not os.path.exists(input_path):
            print(f"  ✗ File not found!")
            continue
        
        fix_and_optimize_image(input_path, output_path)
    
    print("\n" + "=" * 70)
    print("Optimization complete!")

if __name__ == "__main__":
    main()
