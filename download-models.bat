@echo off
REM Jewelry AR Mirror - 3D Model Download Helper (Windows)

echo ========================================
echo Jewelry AR Mirror - Model Download Helper
echo ========================================
echo.

set MODEL_DIR=frontend\public\models

echo Creating models directory...
if not exist "%MODEL_DIR%" mkdir "%MODEL_DIR%"

echo.
echo Manual Download Instructions
echo ========================================
echo.
echo Best Free Earring Models:
echo.
echo 1. Diamond Earrings (Sketchfab)
echo    URL: https://sketchfab.com/3d-models/damond-earrings-537b1b809d69447ab10cd4e93d205b8a
echo    Steps:
echo    - Click 'Download 3D Model'
echo    - Choose 'glTF' or 'glTF Binary (.glb)'
echo    - Login with Google/Facebook (free)
echo    - Save to: %MODEL_DIR%\gold-hoop-earring.glb
echo.
echo 2. Simple Earring (Sketchfab)
echo    URL: https://sketchfab.com/3d-models/earring-3062983a545748079cbdf5a29f2b307b
echo    - Same steps as above
echo    - Save to: %MODEL_DIR%\silver-stud-earring.glb
echo.
echo 3. Browse More:
echo    - Sketchfab: https://sketchfab.com/search?q=earring^&type=models^&features=downloadable
echo    - Poly Pizza: https://poly.pizza/search/earring
echo    - Free3D: https://free3d.com/3d-models/earring
echo.
echo After downloading:
echo    1. Place GLB files in: %MODEL_DIR%\
echo    2. Update file paths in: frontend\src\components\JewelrySelector.jsx
echo    3. Restart frontend: npm run dev
echo.
echo Current status:
dir /b "%MODEL_DIR%\*.glb" 2>nul && echo Models found! || echo No models found yet. App will use procedural fallback.
echo.
echo Done! Happy modeling!
pause
