#!/bin/bash

# Script para converter imagens JPG para WebP com múltiplas resoluções
# Autor: GitHub Copilot
# Data: 2025-12-14

echo "🚀 Iniciando conversão de imagens para WebP..."

# Diretório de origem
SOURCE_DIR="addition photos"
WEBP_DIR="addition photos/webp"

# Criar diretório para WebP se não existir
mkdir -p "$WEBP_DIR"

# Contador
count=0

# Percorrer todos os arquivos JPG
find "$SOURCE_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read img; do
    # Nome base do arquivo sem extensão
    filename=$(basename "$img")
    name="${filename%.*}"
    
    echo "📸 Convertendo: $filename"
    
    # Converter para WebP - Qualidade 85 (ótima qualidade com boa compressão)
    # Tamanho original
    cwebp -q 85 "$img" -o "$WEBP_DIR/${name}.webp" 2>/dev/null
    
    # Versão mobile (800px largura) - para srcset
    cwebp -q 85 -resize 800 0 "$img" -o "$WEBP_DIR/${name}-800w.webp" 2>/dev/null
    
    # Versão tablet (1200px largura) - para srcset
    cwebp -q 85 -resize 1200 0 "$img" -o "$WEBP_DIR/${name}-1200w.webp" 2>/dev/null
    
    # Thumbnail (400px largura) - para lazy loading
    cwebp -q 80 -resize 400 0 "$img" -o "$WEBP_DIR/${name}-thumb.webp" 2>/dev/null
    
    ((count++))
done

echo ""
echo "✅ Conversão concluída!"
echo "📊 Total de imagens processadas: $count"
echo "📁 Arquivos WebP salvos em: $WEBP_DIR"
echo ""
echo "💾 Espaço economizado:"
du -sh "$SOURCE_DIR"/*.jpg 2>/dev/null | awk '{sum+=$1} END {print "   JPG: " sum}'
du -sh "$WEBP_DIR" 2>/dev/null
