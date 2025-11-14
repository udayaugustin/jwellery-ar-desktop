# Jewelry AR Mirror - POC

A real-time augmented reality mirror application for virtually trying on jewelry (earrings, necklaces, piercings, etc.) using face tracking and 3D rendering.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![Node](https://img.shields.io/badge/node-18+-green)

## Features

- **Real-time Face Tracking**: Uses MediaPipe Face Mesh for accurate facial landmark detection
- **3D AR Overlay**: Renders realistic jewelry using Three.js with metallic materials
- **GLTF/GLB Model Support**: Load your own 3D jewelry models for photorealistic rendering
- **Multiple Jewelry Styles**: Switch between different earring designs in real-time
- **Photo Capture**: Take high-resolution snapshots of try-on looks
- **Low Latency**: Optimized for 30+ FPS performance
- **Privacy-First**: All processing done locally, no data uploaded
- **Automatic Fallback**: Works with procedural geometry if no 3D models are available

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + Three.js)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Video Feed  │  │  AR Overlay  │  │  UI Controls │      │
│  │  (Webcam)    │  │  (Three.js)  │  │  (Selector)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                          ▲                                   │
│                          │ WebSocket (Landmarks)             │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         BACKEND (Python + FastAPI)                   │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐   │   │
│  │  │   Camera    │→│   MediaPipe  │→│  WebSocket│   │   │
│  │  │  Processor  │  │  Face Mesh   │  │  Server   │   │   │
│  │  └─────────────┘  └──────────────┘  └───────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Webcam** (720p or higher recommended)
- **Operating System**: Windows, macOS, or Linux

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

**Backend endpoints:**
- WebSocket: `ws://localhost:8000/ws/landmarks`
- Health check: `http://localhost:8000/health`

### Frontend Setup

1. Navigate to the frontend directory (in a new terminal):
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

**First-time setup:**
1. Allow camera permissions when prompted
2. Position your face in the camera view
3. Wait for face detection (green indicator)
4. Select a jewelry style from the bottom menu
5. Move your head to see different angles
6. Click "Capture Photo" to save your try-on

## Usage

### Selecting Jewelry

Use the jewelry selector at the bottom of the screen to switch between different styles:
- **Gold Hoops**: Classic golden hoop earrings
- **Silver Studs**: Elegant silver stud earrings
- **Rose Gold**: Trendy rose gold earrings
- **Diamond**: Sparkling diamond earrings

### Adding Your Own 3D Jewelry Models

The application supports **GLTF/GLB 3D models** for photorealistic jewelry rendering.

**Quick Start:**

1. **Place your 3D model files** in `frontend/public/models/`
   ```
   frontend/public/models/
   ├── gold-hoop-earring.glb
   ├── silver-stud-earring.glb
   └── your-custom-earring.glb
   ```

2. **Update jewelry selector** in `frontend/src/components/JewelrySelector.jsx`:
   ```javascript
   {
     id: 5,
     name: 'My Custom Earring',
     modelPath: '/models/your-custom-earring.glb',
     scale: 1.5,  // Adjust size as needed
     color: '#FFD700'
   }
   ```

3. **Restart the frontend** and test!

**Where to get 3D models:**
- **Create in Blender** (free): https://www.blender.org/
- **Download free models**: Sketchfab, TurboSquid, CGTrader
- **Commission custom models**: Fiverr, Upwork ($20-200 per model)

**Model requirements:**
- Format: GLB or GLTF
- File size: < 5MB
- Polygon count: < 50k triangles
- Materials: PBR (Metallic/Roughness)

📚 **Detailed guide**: See `frontend/public/models/README.md` for complete instructions, tutorials, and troubleshooting.

**No models?** The app automatically falls back to procedural 3D geometry (simple shapes) if no models are available.

### Capturing Photos

1. Position yourself as desired
2. Click the "Capture Photo" button (top-right)
3. The photo will be automatically downloaded to your Downloads folder
4. Filename format: `jewelry-tryOn-[timestamp].png`

### Status Indicators

**Backend Status:**
- 🟢 Green: Connected to backend server
- 🔴 Red: Disconnected from backend server

**Face Detection:**
- 🟢 Green: Face detected and tracking
- 🟡 Yellow: No face detected

**FPS Counter**: Shows current performance (target: 30+ FPS)

## Configuration

### Backend Configuration

Edit `backend/.env` (create from `.env.example`):

```env
# Camera settings
CAMERA_ID=0                    # Camera device ID
CAMERA_WIDTH=1280              # Frame width
CAMERA_HEIGHT=720              # Frame height

# Server settings
HOST=0.0.0.0
PORT=8000

# MediaPipe settings
MAX_NUM_FACES=1                      # Number of faces to track
MIN_DETECTION_CONFIDENCE=0.5         # Detection threshold
MIN_TRACKING_CONFIDENCE=0.5          # Tracking threshold
```

### Frontend Configuration

Edit `frontend/src/services/websocket.js` to change the backend URL:

```javascript
const ws = new LandmarkWebSocket('ws://YOUR_BACKEND_URL:8000/ws/landmarks');
```

## Project Structure

```
jwellery-ar-desktop/
├── README.md                          # This file
├── prd.txt                            # Product requirements
├── POC_IMPLEMENTATION_PLAN.md         # Implementation roadmap
├── .gitignore                         # Git ignore rules
│
├── backend/                           # Python backend
│   ├── requirements.txt               # Python dependencies
│   ├── .env.example                   # Environment template
│   ├── config.py                      # Configuration
│   ├── main.py                        # FastAPI server
│   ├── camera_processor.py            # Camera handling
│   └── landmark_extractor.py          # MediaPipe face tracking
│
└── frontend/                          # React frontend
    ├── package.json                   # Node dependencies
    ├── vite.config.js                 # Vite configuration
    ├── index.html                     # HTML entry point
    ├── public/
    │   └── models/                    # 3D jewelry models (GLTF/GLB)
    │       └── README.md              # Model setup guide
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Main app component
        ├── components/
        │   ├── VideoFeed.jsx          # Webcam display
        │   ├── AROverlay.jsx          # Three.js 3D rendering (supports GLTF)
        │   ├── JewelrySelector.jsx    # Jewelry picker UI
        │   └── SnapshotButton.jsx     # Photo capture
        └── services/
            └── websocket.js           # WebSocket client
```

## Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Python 3.8+ | Server runtime |
| | FastAPI | Web framework & WebSocket server |
| | OpenCV | Camera capture & frame processing |
| | MediaPipe | Face mesh & landmark detection |
| | Uvicorn | ASGI server |
| **Frontend** | React 18 | UI framework |
| | Vite | Build tool & dev server |
| | Three.js | 3D rendering engine |
| | @react-three/fiber | React renderer for Three.js |
| | @react-three/drei | Three.js helpers |
| **Communication** | WebSocket | Real-time landmark streaming |

## Performance Optimization

### Backend Optimizations

- **Single face tracking**: `MAX_NUM_FACES=1` reduces processing overhead
- **Optimized frame rate**: Processing throttled to maintain 30+ FPS
- **Efficient landmark extraction**: Only essential landmarks transmitted

### Frontend Optimizations

- **Canvas-based rendering**: Hardware-accelerated Three.js
- **Minimal re-renders**: React state updates only when needed
- **Procedural geometry**: Earrings created with primitives (no heavy models)
- **Optimized materials**: Efficient metallic/roughness workflow

## Troubleshooting

### Backend Issues

**Camera not found:**
```bash
# List available cameras
python -c "import cv2; print([i for i in range(10) if cv2.VideoCapture(i).isOpened()])"

# Update CAMERA_ID in .env
```

**MediaPipe not installing:**
```bash
# For Apple Silicon Macs:
pip install mediapipe --no-binary mediapipe

# For Linux, you may need:
sudo apt-get install python3-opencv
```

**Port already in use:**
```bash
# Change PORT in .env or kill existing process:
lsof -ti:8000 | xargs kill -9  # macOS/Linux
```

### Frontend Issues

**WebSocket connection failed:**
- Ensure backend is running on `http://localhost:8000`
- Check browser console for errors
- Verify firewall isn't blocking port 8000

**Camera permission denied:**
- Grant camera permissions in browser settings
- Use HTTPS in production (required for camera access)

**Low FPS / Performance:**
- Close other applications using the camera
- Reduce camera resolution in backend config
- Use a dedicated GPU if available

**No face detected:**
- Ensure good lighting conditions
- Position face clearly in camera view
- Remove obstructions (masks, hands)

## Development

### Running in Development Mode

**Backend with auto-reload:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend with hot reload:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend build:**
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

**Backend deployment:**
```bash
# Use gunicorn or uvicorn with workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Future Enhancements

- [x] Multiple 3D model loading (GLTF/GLB files) ✅ **IMPLEMENTED**
- [ ] Support for necklaces and rings
- [ ] Jewelry catalog with database integration
- [ ] User preferences & saved looks
- [ ] Social sharing capabilities
- [ ] Electron packaging for desktop/kiosk app
- [ ] Multi-language support
- [ ] Analytics & usage tracking
- [ ] Virtual try-on for multiple jewelry pieces simultaneously
- [ ] AI-powered jewelry recommendations

## Success Metrics

| Metric | Target | Current Status |
|--------|--------|----------------|
| FPS | 30+ | ✅ Optimized |
| Latency | < 100ms | ✅ Achieved |
| Face Detection Accuracy | 90%+ | ✅ MediaPipe |
| User Satisfaction | 8+/10 | 🔄 Testing |

## License

This is a POC (Proof of Concept) project. License TBD.

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [POC Implementation Plan](POC_IMPLEMENTATION_PLAN.md)
3. Check backend logs in terminal
4. Check browser console for frontend errors

## Credits

- **MediaPipe**: Google's face mesh solution
- **Three.js**: 3D rendering library
- **FastAPI**: Modern Python web framework
- **React**: UI library

---

**Version**: 1.0.0 (POC)
**Last Updated**: 2024
**Status**: ✅ POC Complete
