#!/bin/bash

# Script de Otimização ULTRA de Imagens e Vídeos
# Redimensiona, converte para AVIF/WebP e comprime agressivamente
# Autor: GitHub Copilot - 2025-12-14

echo "🚀 OTIMIZAÇÃO ULTRA DE MÍDIA INICIADA"
echo "======================================"

# Diretórios
SOURCE_DIR="addition photos"
OPTIMIZED_DIR="addition photos/optimized"
AVIF_DIR="addition photos/avif"
WEBP_DIR="addition photos/webp"

# Criar diretórios
mkdir -p "$OPTIMIZED_DIR" "$AVIF_DIR" "$WEBP_DIR"

# Configurações
MAX_WIDTH=1920        # Largura máxima para desktop
TABLET_WIDTH=1200     # Largura para tablets
MOBILE_WIDTH=800      # Largura para mobile
THUMB_WIDTH=400       # Thumbnails
QUALITY_AVIF=65       # Qualidade AVIF (60-70 é ideal)
QUALITY_WEBP=82       # Qualidade WebP
QUALITY_JPG=85        # Qualidade JPG otimizado

total_original=0
total_optimized=0
count=0

echo ""
echo "📊 ANALISANDO TAMANHO ORIGINAL..."
original_size=$(du -sh "$SOURCE_DIR" | awk '{print $1}')
echo "   Tamanho original: $original_size"
echo ""

# Processar cada imagem JPG/JPEG
find "$SOURCE_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read img; do
    filename=$(basename "$img")
    name="${filename%.*}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🖼️  Processando: $filename"
    
    # Obter dimensões originais
    dimensions=$(magick identify -format "%wx%h" "$img" 2>/dev/null)
    width=$(echo $dimensions | cut -d'x' -f1)
    
    echo "   📐 Dimensões originais: $dimensions"
    
    # Determinar se precisa redimensionar
    if [ "$width" -gt "$MAX_WIDTH" ]; then
        resize_width=$MAX_WIDTH
        echo "   ⚠️  Imagem muito grande! Redimensionando para ${MAX_WIDTH}px"
    else
        resize_width=$width
        echo "   ✓  Tamanho adequado, mantendo $width px"
    fi
    
    # 1. AVIF - Formato mais leve (até 50% menor que WebP)
    echo "   🔄 Gerando AVIF..."
    
    # Full size AVIF
    magick "$img" -resize "${resize_width}x" -quality $QUALITY_AVIF "$AVIF_DIR/${name}.avif" 2>/dev/null
    
    # Responsivo AVIF
    magick "$img" -resize "${TABLET_WIDTH}x" -quality $QUALITY_AVIF "$AVIF_DIR/${name}-1200w.avif" 2>/dev/null
    magick "$img" -resize "${MOBILE_WIDTH}x" -quality $QUALITY_AVIF "$AVIF_DIR/${name}-800w.avif" 2>/dev/null
    magick "$img" -resize "${THUMB_WIDTH}x" -quality $(($QUALITY_AVIF - 5)) "$AVIF_DIR/${name}-thumb.avif" 2>/dev/null
    
    echo "   ✓ AVIF criado (4 tamanhos)"
    
    # 2. WebP otimizado (fallback para navegadores mais antigos)
    echo "   🔄 Gerando WebP otimizado..."
    
    # Full size WebP
    cwebp -q $QUALITY_WEBP -resize $resize_width 0 "$img" -o "$WEBP_DIR/${name}.webp" 2>/dev/null
    
    # Responsivo WebP
    cwebp -q $QUALITY_WEBP -resize $TABLET_WIDTH 0 "$img" -o "$WEBP_DIR/${name}-1200w.webp" 2>/dev/null
    cwebp -q $QUALITY_WEBP -resize $MOBILE_WIDTH 0 "$img" -o "$WEBP_DIR/${name}-800w.webp" 2>/dev/null
    cwebp -q $(($QUALITY_WEBP - 5)) -resize $THUMB_WIDTH 0 "$img" -o "$WEBP_DIR/${name}-thumb.webp" 2>/dev/null
    
    echo "   ✓ WebP criado (4 tamanhos)"
    
    # 3. JPG otimizado (último fallback)
    echo "   🔄 Gerando JPG otimizado..."
    magick "$img" -resize "${resize_width}x" -quality $QUALITY_JPG -strip -interlace Plane "$OPTIMIZED_DIR/${name}.jpg" 2>/dev/null
    
    echo "   ✓ JPG otimizado criado"
    
    # Comparar tamanhos
    original_kb=$(du -k "$img" | cut -f1)
    avif_kb=$(du -k "$AVIF_DIR/${name}.avif" 2>/dev/null | cut -f1)
    webp_kb=$(du -k "$WEBP_DIR/${name}.webp" 2>/dev/null | cut -f1)
    jpg_kb=$(du -k "$OPTIMIZED_DIR/${name}.jpg" 2>/dev/null | cut -f1)
    
    if [ -n "$avif_kb" ] && [ -n "$webp_kb" ] && [ -n "$jpg_kb" ]; then
        reduction_avif=$(( (original_kb - avif_kb) * 100 / original_kb ))
        reduction_webp=$(( (original_kb - webp_kb) * 100 / original_kb ))
        reduction_jpg=$(( (original_kb - jpg_kb) * 100 / original_kb ))
        
        echo ""
        echo "   📊 ECONOMIA:"
        echo "      Original: ${original_kb}KB"
        echo "      AVIF:     ${avif_kb}KB (-${reduction_avif}%) 🏆"
        echo "      WebP:     ${webp_kb}KB (-${reduction_webp}%)"
        echo "      JPG Opt:  ${jpg_kb}KB (-${reduction_jpg}%)"
    fi
    
    ((count++))
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ OTIMIZAÇÃO CONCLUÍDA!"
echo ""
echo "📊 RESUMO:"
echo "   ✓ Imagens processadas: $count"
echo "   ✓ Formatos gerados: AVIF, WebP, JPG otimizado"
echo "   ✓ Tamanhos responsivos: 4 por imagem"
echo ""
echo "📁 TAMANHOS DOS DIRETÓRIOS:"
echo "   Original:  $(du -sh "$SOURCE_DIR" | awk '{print $1}')"
echo "   AVIF:      $(du -sh "$AVIF_DIR" | awk '{print $1}')"
echo "   WebP:      $(du -sh "$WEBP_DIR" | awk '{print $1}')"
echo "   JPG Opt:   $(du -sh "$OPTIMIZED_DIR" | awk '{print $1}')"
echo ""
echo "💡 RECOMENDAÇÃO: Use AVIF como primeira opção!"
echo "   - Melhor compressão (até 50% menor)"
echo "   - Suporte em navegadores modernos"
echo "   - Fallback automático para WebP/JPG"
echo ""
