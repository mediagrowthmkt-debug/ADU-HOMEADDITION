#!/bin/bash

# Script de Compressão Ultra de Vídeos
# Converte para H.265 (HEVC) com máxima compressão
# Autor: GitHub Copilot - 2025-12-14

echo "🎬 COMPRESSÃO ULTRA DE VÍDEOS INICIADA"
echo "======================================"

VIDEO_DIR="addition photos"
OUTPUT_DIR="addition photos/optimized-videos"

mkdir -p "$OUTPUT_DIR"

# Verificar se ffmpeg está instalado
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ERRO: ffmpeg não encontrado!"
    echo "   Instale com: brew install ffmpeg"
    exit 1
fi

total_saved=0

# Processar cada vídeo
find "$VIDEO_DIR" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" \) | while read video; do
    filename=$(basename "$video")
    name="${filename%.*}"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎥 Processando: $filename"
    
    # Obter tamanho original
    original_size=$(du -h "$video" | awk '{print $1}')
    original_kb=$(du -k "$video" | cut -f1)
    
    echo "   📊 Tamanho original: $original_size"
    
    # Obter informações do vídeo
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video" 2>/dev/null | cut -d. -f1)
    resolution=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$video" 2>/dev/null)
    
    echo "   📐 Resolução: $resolution"
    echo "   ⏱️  Duração: ${duration}s"
    
    # Compressão 1: H.265 Alta Qualidade (CRF 28 - visual quase idêntico)
    echo "   🔄 Comprimindo com H.265 (CRF 28)..."
    ffmpeg -i "$video" \
        -c:v libx265 \
        -preset medium \
        -crf 28 \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -tag:v hvc1 \
        -y "$OUTPUT_DIR/${name}-h265.mp4" \
        -loglevel error -stats
    
    if [ $? -eq 0 ]; then
        h265_size=$(du -h "$OUTPUT_DIR/${name}-h265.mp4" | awk '{print $1}')
        h265_kb=$(du -k "$OUTPUT_DIR/${name}-h265.mp4" | cut -f1)
        reduction=$(( (original_kb - h265_kb) * 100 / original_kb ))
        
        echo "   ✓ H.265 criado: $h265_size (-${reduction}%)"
    fi
    
    # Compressão 2: WebM VP9 (alternativa moderna)
    echo "   🔄 Comprimindo com WebM/VP9..."
    ffmpeg -i "$video" \
        -c:v libvpx-vp9 \
        -crf 35 \
        -b:v 0 \
        -c:a libopus \
        -b:a 128k \
        -y "$OUTPUT_DIR/${name}.webm" \
        -loglevel error -stats
    
    if [ $? -eq 0 ]; then
        webm_size=$(du -h "$OUTPUT_DIR/${name}.webm" | awk '{print $1}')
        webm_kb=$(du -k "$OUTPUT_DIR/${name}.webm" | cut -f1)
        reduction_webm=$(( (original_kb - webm_kb) * 100 / original_kb ))
        
        echo "   ✓ WebM criado: $webm_size (-${reduction_webm}%)"
    fi
    
    # Compressão 3: H.264 Compatível (fallback máximo)
    echo "   🔄 Criando fallback H.264..."
    ffmpeg -i "$video" \
        -c:v libx264 \
        -preset medium \
        -crf 26 \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y "$OUTPUT_DIR/${name}-h264.mp4" \
        -loglevel error -stats
    
    if [ $? -eq 0 ]; then
        h264_size=$(du -h "$OUTPUT_DIR/${name}-h264.mp4" | awk '{print $1}')
        h264_kb=$(du -k "$OUTPUT_DIR/${name}-h264.mp4" | cut -f1)
        reduction_h264=$(( (original_kb - h264_kb) * 100 / original_kb ))
        
        echo "   ✓ H.264 criado: $h264_size (-${reduction_h264}%)"
    fi
    
    echo ""
    echo "   📊 COMPARAÇÃO:"
    echo "      Original:  ${original_size} (100%)"
    echo "      H.265:     ${h265_size} (-${reduction}%) 🏆"
    echo "      WebM:      ${webm_size} (-${reduction_webm}%)"
    echo "      H.264:     ${h264_size} (-${reduction_h264}%)"
    
    saved=$((original_kb - h265_kb))
    total_saved=$((total_saved + saved))
    
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ COMPRESSÃO CONCLUÍDA!"
echo ""
echo "📊 RESUMO FINAL:"
echo "   ✓ Vídeos processados: 2"
echo "   ✓ Formatos criados: H.265, WebM, H.264"
echo "   ✓ Economia total: $((total_saved / 1024))MB"
echo ""
echo "📁 DIRETÓRIO DE SAÍDA:"
du -sh "$OUTPUT_DIR"
echo ""
echo "💡 RECOMENDAÇÃO DE USO:"
echo "   1️⃣  Primeira opção: H.265 (melhor qualidade/tamanho)"
echo "   2️⃣  Fallback moderno: WebM/VP9"
echo "   3️⃣  Fallback universal: H.264"
echo ""
echo "📝 CÓDIGO HTML SUGERIDO:"
echo '<video controls preload="metadata" poster="thumbnail.jpg">'
echo '  <source src="video-h265.mp4" type="video/mp4; codecs=hevc">'
echo '  <source src="video.webm" type="video/webm">'
echo '  <source src="video-h264.mp4" type="video/mp4">'
echo '  Seu navegador não suporta vídeos.'
echo '</video>'
echo ""
