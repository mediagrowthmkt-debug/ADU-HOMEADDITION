#!/usr/bin/env python3
"""
Script to check EXIF orientation data in images
"""

import os
from PIL import Image, ExifTags

def check_image_orientation(image_path):
    """
    Check the orientation of an image based on its EXIF data
    """
    try:
        image = Image.open(image_path)
        
        # Check if image has EXIF data
        try:
            exif = image._getexif()
            if exif is None:
                return None, "No EXIF"
                
            # Find the orientation tag
            for orientation_key in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation_key] == 'Orientation':
                    break
            
            if orientation_key not in exif:
                return None, "No orientation tag"
                
            orientation = exif[orientation_key]
            
            orientation_map = {
                1: "Normal",
                2: "Mirrored horizontal",
                3: "Rotated 180°",
                4: "Mirrored vertical",
                5: "Mirrored horizontal + rotated 270°",
                6: "Rotated 90° CW (270° CCW)",
                7: "Mirrored horizontal + rotated 90°",
                8: "Rotated 270° CW (90° CCW)"
            }
            
            return orientation, orientation_map.get(orientation, f"Unknown ({orientation})")
            
        except (AttributeError, KeyError, IndexError) as e:
            return None, f"Error: {e}"
            
    except Exception as e:
        return None, f"Cannot open: {e}"

def main():
    # Path to the images directory
    images_dir = "images"
    
    if not os.path.exists(images_dir):
        print(f"Directory '{images_dir}' not found!")
        return
    
    print(f"Checking EXIF orientation in {images_dir}...")
    print("=" * 80)
    
    needs_rotation = []
    
    # Process all image files
    for filename in sorted(os.listdir(images_dir)):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            image_path = os.path.join(images_dir, filename)
            orientation_code, orientation_desc = check_image_orientation(image_path)
            
            print(f"{filename:50} | {orientation_desc}")
            
            # Track images that need rotation (orientations 3, 6, or 8)
            if orientation_code in [3, 6, 8]:
                needs_rotation.append((filename, orientation_code, orientation_desc))
    
    print("=" * 80)
    
    if needs_rotation:
        print(f"\n{len(needs_rotation)} image(s) need rotation:")
        for filename, code, desc in needs_rotation:
            print(f"  • {filename}: {desc}")
    else:
        print("\nNo images need rotation based on EXIF data.")

if __name__ == "__main__":
    main()
