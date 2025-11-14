#!/bin/bash

# Jewelry AR Mirror - 3D Model Download Helper
# This script helps you download free earring models

echo "🎨 Jewelry AR Mirror - Model Download Helper"
echo "============================================="
echo ""

MODEL_DIR="frontend/public/models"

echo "📁 Creating models directory..."
mkdir -p "$MODEL_DIR"

echo ""
echo "📥 Option 1: Download from Direct URLs"
echo "----------------------------------------"
echo "If you have direct GLB/GLTF download URLs, enter them below:"
echo ""

read -p "Enter URL for gold-hoop-earring.glb (or press Enter to skip): " URL1
if [ ! -z "$URL1" ]; then
    echo "Downloading..."
    curl -L "$URL1" -o "$MODEL_DIR/gold-hoop-earring.glb"
    echo "✅ Downloaded gold-hoop-earring.glb"
fi

read -p "Enter URL for silver-stud-earring.glb (or press Enter to skip): " URL2
if [ ! -z "$URL2" ]; then
    echo "Downloading..."
    curl -L "$URL2" -o "$MODEL_DIR/silver-stud-earring.glb"
    echo "✅ Downloaded silver-stud-earring.glb"
fi

echo ""
echo "📋 Manual Download Instructions"
echo "================================"
echo ""
echo "👉 Best Free Earring Models:"
echo ""
echo "1. Diamond Earrings (Sketchfab)"
echo "   URL: https://sketchfab.com/3d-models/damond-earrings-537b1b809d69447ab10cd4e93d205b8a"
echo "   Steps:"
echo "   - Click 'Download 3D Model'"
echo "   - Choose 'glTF' or 'glTF Binary (.glb)'"
echo "   - Login with Google/Facebook (free)"
echo "   - Save to: $MODEL_DIR/gold-hoop-earring.glb"
echo ""
echo "2. Simple Earring (Sketchfab)"
echo "   URL: https://sketchfab.com/3d-models/earring-3062983a545748079cbdf5a29f2b307b"
echo "   - Same steps as above"
echo "   - Save to: $MODEL_DIR/silver-stud-earring.glb"
echo ""
echo "3. Jewelry Findings (Sketchfab)"
echo "   URL: https://sketchfab.com/3d-models/earring-jewelry-findings-and-hinges-950d6672a8c54078b5e481827aae0ea7"
echo "   - Same steps as above"
echo "   - Save to: $MODEL_DIR/rose-gold-earring.glb"
echo ""
echo "4. Browse More:"
echo "   - Sketchfab: https://sketchfab.com/search?q=earring&type=models&features=downloadable"
echo "   - Poly Pizza: https://poly.pizza/search/earring"
echo "   - Free3D: https://free3d.com/3d-models/earring"
echo ""
echo "💡 After downloading:"
echo "   1. Place GLB files in: $MODEL_DIR/"
echo "   2. Update file paths in: frontend/src/components/JewelrySelector.jsx"
echo "   3. Restart frontend: npm run dev"
echo ""
echo "🎯 Current status:"
ls -lh "$MODEL_DIR"/*.glb 2>/dev/null && echo "✅ Models found!" || echo "⚠️  No models found yet. App will use procedural fallback."
echo ""
echo "Done! Happy modeling! 💍✨"
