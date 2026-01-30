#!/usr/bin/env python3
"""
Simple CSS minifier
"""

import re

def minify_css(css):
    """
    Simple CSS minification
    """
    # Remove comments
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.DOTALL)
    # Remove whitespace
    css = re.sub(r'\s+', ' ', css)
    # Remove spaces around special characters
    css = re.sub(r'\s*([{}:;,>+])\s*', r'\1', css)
    # Remove trailing semicolons
    css = re.sub(r';}', '}', css)
    return css.strip()

def main():
    print("Minifying CSS...")
    
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
