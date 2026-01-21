#!/usr/bin/env python3
"""
Better CSS minifier that preserves selectors
"""

import re

def minify_css(css):
    """
    Minify CSS while preserving selector integrity
    """
    # Remove comments
    css = re.sub(r'/\*[\s\S]*?\*/', '', css)
    
    # Remove extra whitespace but preserve single spaces in selectors
    lines = css.split('\n')
    result = []
    
    for line in lines:
        # Strip leading/trailing whitespace
        line = line.strip()
        if line:
            result.append(line)
    
    css = ' '.join(result)
    
    # Remove spaces around { } : ; ,
    css = re.sub(r'\s*{\s*', '{', css)
    css = re.sub(r'\s*}\s*', '}', css)
    css = re.sub(r'\s*:\s*', ':', css)
    css = re.sub(r'\s*;\s*', ';', css)
    css = re.sub(r'\s*,\s*', ',', css)
    
    # Remove last semicolon before }
    css = re.sub(r';}', '}', css)
    
    # Remove multiple spaces
    css = re.sub(r'  +', ' ', css)
    
    return css.strip()

def main():
    print("Minifying CSS (safe mode)...")
    
    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()
    
    minified = minify_css(css)
    
    with open('styles.min.css', 'w', encoding='utf-8') as f:
        f.write(minified)
    
    original_size = len(css) / 1024
    minified_size = len(minified) / 1024
    savings = ((original_size - minified_size) / original_size) * 100
    
    print(f"✓ Original: {original_size:.2f}KB")
    print(f"✓ Minified: {minified_size:.2f}KB")
    print(f"✓ Saved: {savings:.1f}%")

if __name__ == "__main__":
    main()
