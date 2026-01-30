#!/usr/bin/env python3
"""
Script to regenerate optimized WebP versions (thumbnails and 800w)
"""

import os
from PIL import Image
import sys

def create_responsive_versions(source_path, base_name, output_dir):
    """
    Create thumbnail and 800w versions of an image
    """
    try:
        image = Image.open(source_path)
        
        # Create thumbnail (400w)
        thumb_size = (400, int(400 * image.height / image.width))
        thumb = image.copy()
        thumb.thumbnail(thumb_size, Image.Resampling.LANCZOS)
        thumb_path = os.path.join(output_dir, f"{base_name}-thumb.webp")
        thumb.save(thumb_path, 'WEBP', quality=85)
        print(f"    ✓ Created thumbnail: {base_name}-thumb.webp")
        
        # Create 800w version
        if image.width > 800:
            medium_size = (800, int(800 * image.height / image.width))
            medium = image.copy()
            medium.thumbnail(medium_size, Image.Resampling.LANCZOS)
            medium_path = os.path.join(output_dir, f"{base_name}-800w.webp")
            medium.save(medium_path, 'WEBP', quality=85)
            print(f"    ✓ Created 800w: {base_name}-800w.webp")
        
        return True
            
    except Exception as e:
        print(f"    ✗ Error: {e}")
        return False

def main():
    # Paths
    photos_dir = "addition photos"
    webp_output_dir = os.path.join(photos_dir, "webp")
    
    # Create webp directory if it doesn't exist
    os.makedirs(webp_output_dir, exist_ok=True)
    
    # Images that were fixed (only the ones with numbers, as they have responsive versions)
    images_to_process = [
        ("1.webp", "1"),
        ("2.webp", "2"),
        ("3.webp", "3")
    ]
    
    print("Generating responsive WebP versions...")
    print("=" * 70)
    
    processed = 0
    
    for filename, base_name in images_to_process:
        source_path = os.path.join(photos_dir, filename)
        
        print(f"\nProcessing {filename}...")
        
        if not os.path.exists(source_path):
            print(f"  ✗ Source file not found!")
            continue
        
        # Copy main file to webp directory
        try:
            image = Image.open(source_path)
            main_path = os.path.join(webp_output_dir, f"{base_name}.webp")
            image.save(main_path, 'WEBP', quality=90)
            print(f"    ✓ Saved main: {base_name}.webp")
        except Exception as e:
            print(f"    ✗ Error saving main file: {e}")
            continue
        
        if create_responsive_versions(source_path, base_name, webp_output_dir):
            processed += 1
    
    print("\n" + "=" * 70)
    print(f"Processed {processed} out of {len(images_to_process)} images")
    print(f"\nResponsive versions created in: {webp_output_dir}")

if __name__ == "__main__":
    main()
