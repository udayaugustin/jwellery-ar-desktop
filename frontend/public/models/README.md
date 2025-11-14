# 3D Jewelry Models

This directory contains 3D models of jewelry (earrings, necklaces, etc.) in GLTF/GLB format.

## 📁 File Structure

Place your 3D model files here:
```
frontend/public/models/
├── README.md (this file)
├── gold-hoop-earring.glb
├── silver-stud-earring.glb
├── rose-gold-earring.glb
├── diamond-earring.glb
└── ... (your other jewelry models)
```

## 🎨 How to Add Your 3D Models

### Option 1: Use Existing 3D Models

If you have 3D models of your jewelry:

1. **Convert to GLTF/GLB format** (if not already)
   - Use Blender: File → Export → glTF 2.0 (.glb/.gltf)
   - Or use online converters

2. **Optimize the model**
   - Keep file size under 5MB per model
   - Reduce polygon count if needed (aim for < 50k triangles)
   - Compress textures to reasonable sizes

3. **Place files here**
   - Copy your `.glb` or `.gltf` files to this directory
   - Use descriptive names (e.g., `gold-hoop-earring.glb`)

4. **Update the jewelry selector**
   - Edit `frontend/src/components/JewelrySelector.jsx`
   - Update the `modelPath` for each jewelry item

### Option 2: Create Models in Blender (Free)

**Step-by-step guide:**

1. **Download Blender** (free): https://www.blender.org/download/

2. **Create your earring model:**
   ```
   - Open Blender
   - Delete default cube (X key)
   - Add → Mesh → Torus (for hoop earring)
   - Or model your custom design
   - Scale appropriately (earrings are small!)
   ```

3. **Add materials:**
   ```
   - Switch to Shading workspace
   - Add material (right panel → Material Properties)
   - For metallic jewelry:
     * Base Color: Gold (#FFD700), Silver (#C0C0C0), etc.
     * Metallic: 0.9 - 1.0
     * Roughness: 0.1 - 0.3
   ```

4. **Export:**
   ```
   - File → Export → glTF 2.0 (.glb)
   - Format: glTF Binary (.glb)
   - Include: Selected Objects (or visible)
   - Save to this directory
   ```

### Option 3: Download Free Models

**Websites with free 3D models:**

- **Sketchfab**: https://sketchfab.com/search?q=earring&type=models
  - Filter: "Downloadable"
  - Choose "glTF" format

- **TurboSquid Free**: https://www.turbosquid.com/Search/3D-Models/free/earring
  - Download and convert to GLB if needed

- **CGTrader Free**: https://www.cgtrader.com/free-3d-models/jewelry/earring

- **Poly Pizza**: https://poly.pizza/search/earring

**Tips for downloading:**
- Look for "PBR" materials (Physically Based Rendering)
- Check file size (smaller is better for web)
- Read license terms (commercial use if selling)

### Option 4: Commission Custom Models

If you need professional models of your actual jewelry:

- **Fiverr**: Search for "3D jewelry modeling"
- **Upwork**: Hire 3D artists
- **Local 3D artists**: Contact design schools

**Typical costs:**
- Simple earrings: $20-50 per model
- Complex designs: $50-200 per model
- Full collection: Negotiate bulk pricing

## 📐 Model Specifications

### Recommended Settings:

| Property | Value |
|----------|-------|
| **Format** | GLB (binary GLTF) preferred |
| **File Size** | < 5MB per model |
| **Polygon Count** | < 50,000 triangles |
| **Texture Size** | 1024x1024 or 2048x2048 max |
| **Materials** | PBR (Metallic/Roughness workflow) |
| **Units** | Real-world scale (cm or mm) |

### Model Orientation:

For best results, orient your earring model:
- **Forward**: Facing +Z axis
- **Up**: +Y axis
- **Hook/attachment**: At top (positive Y)

## 🔧 Testing Your Models

1. **Place model file** in this directory
2. **Update jewelry selector:**
   ```javascript
   // In frontend/src/components/JewelrySelector.jsx
   {
     id: 5,
     name: 'My Custom Earring',
     type: 'earrings',
     color: '#FFD700',
     modelPath: '/models/my-custom-earring.glb', // Your file name
     scale: 1.5, // Adjust if too big/small
   }
   ```
3. **Restart frontend**: `npm run dev`
4. **Test in browser**: Select your jewelry from the UI

### Troubleshooting:

**Model not appearing:**
- Check file path is correct (case-sensitive!)
- Verify file is in `frontend/public/models/`
- Check browser console for errors
- Try with a different model to isolate the issue

**Model too big/small:**
- Adjust the `scale` property in JewelrySelector.jsx
- Or resize model in Blender before exporting

**Wrong orientation:**
- Rotate model in Blender (R + X/Y/Z + 90)
- Re-export and test

**Poor performance:**
- Reduce polygon count in Blender (Modifier → Decimate)
- Compress textures
- Use simpler materials

## 📚 Resources

**GLTF/GLB Format:**
- GLTF Official Spec: https://www.khronos.org/gltf/
- GLTF Viewer: https://gltf-viewer.donmccurdy.com/

**3D Modeling Tutorials:**
- Blender Beginner Tutorial: https://www.youtube.com/watch?v=nIoXOplUvAw
- Jewelry Modeling in Blender: Search YouTube for "blender jewelry tutorial"
- PBR Materials Guide: https://marmoset.co/posts/basic-theory-of-physically-based-rendering/

**Model Optimization:**
- Blender Optimization: https://docs.blender.org/manual/en/latest/modeling/meshes/editing/mesh/delete.html
- GLTF Transform (CLI tool): https://github.com/donmccurdy/glTF-Transform

## 🎯 Quick Start (No 3D Models?)

**No problem!** The app has a **fallback mode** that uses procedural 3D geometry (auto-generated shapes).

If no models are available:
- App will show simple geometric earrings
- Different colors for each style
- Fully functional for testing

To use fallback mode:
- Simply don't add any GLB files
- Or set `modelPath: null` in JewelrySelector.jsx

## 📞 Need Help?

If you're stuck:
1. Check the main README.md troubleshooting section
2. Verify your model in an online GLTF viewer first
3. Test with a free model from Sketchfab to isolate issues
4. Check browser console for specific error messages

---

**Happy modeling!** 💍✨
