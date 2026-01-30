#!/usr/bin/env python3
"""
Script to optimize steeps images with smaller file size
"""

import os
from PIL import Image, ExifTags

def fix_and_optimize_image(input_path, output_path, max_width=800):
    """
    Fix orientation and optimize image with max width
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
                    elif orientation == 6:
                        image = image.rotate(270, expand=True)
                    elif orientation == 8:
                        image = image.rotate(90, expand=True)
        except (AttributeError, KeyError, IndexError):
            pass
        
        # Resize to max width while maintaining aspect ratio
        if image.width > max_width:
            ratio = max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
            print(f"  Resized to {max_width}x{new_height}")
        
        # Save as WebP with lower quality
        image.save(output_path, 'WEBP', quality=75)
        
        # Get file sizes
        original_size = os.path.getsize(input_path) / 1024
        new_size = os.path.getsize(output_path) / 1024
        
        print(f"  ✓ {original_size:.0f}KB → {new_size:.0f}KB")
        return True
            
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    steeps_dir = "steeps"
    
    print("Re-optimizing steeps images (smaller size)...")
    print("=" * 50)
    
    images = [
        ("1.jpg", "step-1-foundation.webp"),
        ("2.jpg", "step-2-framing.webp"),
        ("3.jpg", "step-3-sheathing.webp"),
        ("final adu.jpg", "step-4-complete.webp")
    ]
    
    for input_file, output_file in images:
        input_path = os.path.join(steeps_dir, input_file)
        output_path = os.path.join(steeps_dir, output_file)
        
        print(f"\n{input_file}:")
        
        if not os.path.exists(input_path):
            print(f"  ✗ File not found!")
            continue
        
        fix_and_optimize_image(input_path, output_path, max_width=800)
    
    print("\n" + "=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()
