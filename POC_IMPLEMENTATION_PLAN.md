# POC Implementation Plan: Jewelry AR Mirror

## Executive Summary

This POC will demonstrate the core feasibility of the Jewelry AR Mirror application by implementing a minimal viable prototype that tracks face landmarks and overlays a single jewelry item (earrings) in real-time.

**POC Duration:** 2-3 weeks
**POC Scope:** Face tracking + Single earring overlay + Basic UI
**Success Criteria:** 30+ FPS, stable tracking, realistic overlay positioning

---

## Phase 1: Environment Setup (Day 1)

### 1.1 Backend Environment
```bash
# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install core dependencies
pip install opencv-python mediapipe fastapi uvicorn websockets numpy
```

**Deliverables:**
- `backend/requirements.txt` with all dependencies
- `backend/.env.example` for configuration templates
- Virtual environment activated and tested

### 1.2 Frontend Environment
```bash
# Create frontend with Vite + React
npm create vite@latest frontend -- --template react
cd frontend
npm install three @react-three/fiber @react-three/drei
npm install socket.io-client
```

**Deliverables:**
- `frontend/package.json` with dependencies
- Development server running successfully
- Basic React app scaffolding

### 1.3 Project Structure
```
jwellery-ar-desktop/
├── prd.txt
├── POC_IMPLEMENTATION_PLAN.md
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py
│   ├── camera_processor.py
│   ├── landmark_extractor.py
│   └── config.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── VideoFeed.jsx
│       │   ├── AROverlay.jsx
│       │   └── JewelrySelector.jsx
│       └── services/
│           └── websocket.js
└── assets/
    └── models/
        └── earring-simple.glb
```

**Deliverables:**
- Complete folder structure created
- README.md with setup instructions

---

## Phase 2: Backend Core - Face Tracking (Days 2-4)

### 2.1 Camera Processing Module

**File:** `backend/camera_processor.py`

**Key Features:**
- Initialize webcam with OpenCV
- Capture frames at 30+ FPS
- Resize/optimize frames for processing
- FPS counter and monitoring

**Code Structure:**
```python
class CameraProcessor:
    def __init__(self, camera_id=0, width=1280, height=720):
        # Initialize camera

    def capture_frame(self):
        # Capture and return frame

    def release(self):
        # Clean up resources
```

**Testing:**
- Verify webcam access
- Confirm 30+ FPS capture
- Test with different resolutions

### 2.2 Landmark Extraction Module

**File:** `backend/landmark_extractor.py`

**Key Features:**
- MediaPipe Face Mesh integration
- Extract ear landmarks (left ear: [234, 454], right ear: [127, 356])
- Extract face orientation (rotation, tilt)
- Calculate 3D positions for jewelry placement

**Code Structure:**
```python
class LandmarkExtractor:
    def __init__(self):
        # Initialize MediaPipe Face Mesh

    def extract_landmarks(self, frame):
        # Process frame and return landmarks
        # Returns: {
        #   'left_ear': {'x': float, 'y': float, 'z': float},
        #   'right_ear': {'x': float, 'y': float, 'z': float},
        #   'face_rotation': {'pitch': float, 'yaw': float, 'roll': float}
        # }

    def get_ear_positions(self, landmarks):
        # Extract specific ear landmark positions
```

**Landmark Mapping:**
- Left ear top: MediaPipe index 234
- Left ear bottom: MediaPipe index 454
- Right ear top: MediaPipe index 127
- Right ear bottom: MediaPipe index 356
- Nose tip: MediaPipe index 4 (for orientation reference)

**Testing:**
- Verify landmark detection on test images
- Test with different face angles
- Validate ear position accuracy

### 2.3 FastAPI Server with WebSocket

**File:** `backend/main.py`

**Key Features:**
- FastAPI app setup
- WebSocket endpoint for real-time streaming
- Health check endpoint
- CORS configuration for frontend

**Code Structure:**
```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.websocket("/ws/landmarks")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    camera = CameraProcessor()
    extractor = LandmarkExtractor()

    try:
        while True:
            frame = camera.capture_frame()
            landmarks = extractor.extract_landmarks(frame)

            # Send landmarks to frontend
            await websocket.send_json({
                "timestamp": time.time(),
                "landmarks": landmarks,
                "fps": camera.get_fps()
            })

            await asyncio.sleep(0.001)  # ~1000 FPS theoretical max

    except Exception as e:
        print(f"Error: {e}")
    finally:
        camera.release()
```

**Testing:**
- Test WebSocket connection with a simple client
- Verify landmark data is streamed correctly
- Monitor latency and FPS

**Deliverables:**
- Working backend server on `http://localhost:8000`
- WebSocket streaming landmarks at 30+ FPS
- Health check endpoint returning status

---

## Phase 3: Frontend Core - 3D Rendering (Days 5-7)

### 3.1 WebSocket Client

**File:** `frontend/src/services/websocket.js`

**Key Features:**
- Connect to backend WebSocket
- Receive landmark data
- Handle reconnection logic
- Emit events for React components

**Code Structure:**
```javascript
class LandmarkWebSocket {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = {};
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit('landmarks', data);
    };

    this.ws.onclose = () => {
      // Reconnection logic
      setTimeout(() => this.connect(), 1000);
    };
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export default LandmarkWebSocket;
```

### 3.2 Three.js Scene Setup

**File:** `frontend/src/components/AROverlay.jsx`

**Key Features:**
- Three.js scene with camera and lighting
- 3D earring model loading
- Real-time position/rotation updates
- Rendering loop synchronized with landmark data

**Code Structure (using @react-three/fiber):**
```jsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { useEffect, useState } from 'react';

function Earring({ position, rotation, modelPath }) {
  const { scene } = useGLTF(modelPath);

  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={[0.1, 0.1, 0.1]}
    />
  );
}

function AROverlay({ landmarks }) {
  const [leftEarPos, setLeftEarPos] = useState([0, 0, 0]);
  const [rightEarPos, setRightEarPos] = useState([0, 0, 0]);

  useEffect(() => {
    if (landmarks?.left_ear) {
      // Convert normalized coordinates to 3D position
      setLeftEarPos([
        landmarks.left_ear.x * 2 - 1,  // Convert to -1 to 1
        -(landmarks.left_ear.y * 2 - 1),
        landmarks.left_ear.z
      ]);
    }

    if (landmarks?.right_ear) {
      setRightEarPos([
        landmarks.right_ear.x * 2 - 1,
        -(landmarks.right_ear.y * 2 - 1),
        landmarks.right_ear.z
      ]);
    }
  }, [landmarks]);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />

      <Earring
        position={leftEarPos}
        rotation={[0, 0, 0]}
        modelPath="/models/earring-simple.glb"
      />
      <Earring
        position={rightEarPos}
        rotation={[0, Math.PI, 0]}  // Mirror for right ear
        modelPath="/models/earring-simple.glb"
      />
    </Canvas>
  );
}

export default AROverlay;
```

### 3.3 Video Feed Component

**File:** `frontend/src/components/VideoFeed.jsx`

**Key Features:**
- Display live webcam feed as background
- Mirror effect (horizontally flipped)
- Overlay AR canvas on top

**Code Structure:**
```jsx
import { useEffect, useRef } from 'react';

function VideoFeed() {
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)',  // Mirror effect
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    />
  );
}

export default VideoFeed;
```

### 3.4 Main App Integration

**File:** `frontend/src/App.jsx`

**Code Structure:**
```jsx
import { useState, useEffect } from 'react';
import VideoFeed from './components/VideoFeed';
import AROverlay from './components/AROverlay';
import LandmarkWebSocket from './services/websocket';

function App() {
  const [landmarks, setLandmarks] = useState(null);
  const [fps, setFps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new LandmarkWebSocket('ws://localhost:8000/ws/landmarks');

    ws.on('landmarks', (data) => {
      setLandmarks(data.landmarks);
      setFps(data.fps);
    });

    ws.connect();
    setIsConnected(true);

    return () => {
      if (ws.ws) {
        ws.ws.close();
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VideoFeed />
      <AROverlay landmarks={landmarks} />

      {/* Status overlay */}
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', zIndex: 10 }}>
        <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
        <div>FPS: {fps.toFixed(1)}</div>
      </div>
    </div>
  );
}

export default App;
```

**Deliverables:**
- Working frontend on `http://localhost:5173`
- Video feed displaying webcam
- 3D earrings rendering on screen
- Real-time updates from landmark data

---

## Phase 4: 3D Asset Creation (Days 8-9)

### 4.1 Simple Earring Model

**Options:**

**Option A: Use Blender (Free)**
1. Create simple hoop earring geometry
2. Add metallic gold material
3. Export as GLTF/GLB format
4. Optimize for web (< 500KB)

**Option B: Use Three.js Primitives (Quick Test)**
```javascript
// Temporary geometry for testing
function SimpleEarring({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}
```

**Option C: Download Free Models**
- Sketchfab (search "earring")
- CGTrader free section
- TurboSquid free models

**Recommended:** Start with Option B for immediate testing, then create/download proper models.

**Deliverables:**
- `assets/models/earring-simple.glb` (or procedural geometry)
- Test model loads and renders correctly
- Metallic material with realistic appearance

### 4.2 Material Testing

**Key Materials:**
- Gold (metallic: 0.9, roughness: 0.1)
- Silver (metallic: 1.0, roughness: 0.2)
- Diamond/gem (transmission, refraction)

**Testing:**
- Render under different lighting conditions
- Verify performance impact
- Optimize textures if needed

---

## Phase 5: Integration & Calibration (Days 10-12)

### 5.1 Coordinate System Alignment

**Challenge:** MediaPipe landmarks are in normalized coordinates (0-1), Three.js uses world coordinates.

**Solution:**
```javascript
function convertLandmarkTo3D(landmark, videoWidth, videoHeight) {
  // MediaPipe gives normalized coordinates
  // Convert to screen space first
  const screenX = landmark.x * videoWidth;
  const screenY = landmark.y * videoHeight;

  // Convert to Three.js world space (-1 to 1)
  const worldX = (screenX / videoWidth) * 2 - 1;
  const worldY = -((screenY / videoHeight) * 2 - 1);  // Flip Y
  const worldZ = landmark.z * 2;  // Scale Z appropriately

  return [worldX, worldY, worldZ];
}
```

**Calibration Steps:**
1. Display landmark dots on video to verify positions
2. Adjust Three.js camera FOV to match webcam FOV
3. Scale earring models to appropriate size
4. Fine-tune Z-axis positioning (depth)

### 5.2 Rotation & Orientation

**Face Rotation Calculation:**
```python
# In landmark_extractor.py
def calculate_head_rotation(landmarks):
    # Use specific landmarks to calculate Euler angles
    # Nose tip, chin, forehead points
    nose = landmarks[4]
    chin = landmarks[152]
    forehead = landmarks[10]

    # Calculate pitch, yaw, roll
    # ... (implementation details)

    return {
        'pitch': pitch,  # Up/down tilt
        'yaw': yaw,      # Left/right turn
        'roll': roll     # Tilt/lean
    }
```

**Apply to Earrings:**
```javascript
function Earring({ position, rotation, faceRotation }) {
  const [pitch, yaw, roll] = faceRotation;

  return (
    <primitive
      object={model}
      position={position}
      rotation={[pitch, yaw, roll]}
    />
  );
}
```

### 5.3 Performance Optimization

**Backend Optimizations:**
- Reduce MediaPipe model complexity (set `max_num_faces=1`)
- Skip frames if processing is lagging
- Use multiprocessing for camera capture

**Frontend Optimizations:**
- Limit render loop to 60 FPS max
- Use `useMemo` for expensive calculations
- Implement level-of-detail for 3D models
- Throttle WebSocket message processing

**Target Metrics:**
- Backend processing: < 20ms per frame
- WebSocket latency: < 10ms
- Frontend render: 60 FPS (16.6ms per frame)
- End-to-end latency: < 100ms

**Deliverables:**
- Calibrated coordinate system
- Earrings track face movement accurately
- Smooth 30+ FPS performance
- Minimal latency between movement and overlay update

---

## Phase 6: UI & User Experience (Days 13-14)

### 6.1 Basic UI Components

**File:** `frontend/src/components/JewelrySelector.jsx`

```jsx
function JewelrySelector({ onSelect }) {
  const jewelry = [
    { id: 1, name: 'Gold Hoops', model: '/models/earring-gold-hoop.glb' },
    { id: 2, name: 'Silver Studs', model: '/models/earring-silver-stud.glb' },
    { id: 3, name: 'Diamond Drops', model: '/models/earring-diamond-drop.glb' }
  ];

  return (
    <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        {jewelry.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 6.2 Snapshot Feature

**File:** `frontend/src/components/SnapshotButton.jsx`

```jsx
import { useRef } from 'react';

function SnapshotButton() {
  const canvasRef = useRef(null);

  const captureSnapshot = () => {
    // Capture both video and Three.js canvas
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Overlay Three.js render
    const threeCanvas = document.querySelector('canvas');
    ctx.drawImage(threeCanvas, 0, 0);

    // Download
    const link = document.createElement('a');
    link.download = `jewelry-tryOn-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <button
      onClick={captureSnapshot}
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: '10px 20px',
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
    >
      📸 Capture
    </button>
  );
}
```

**Deliverables:**
- Jewelry selection UI
- Snapshot/photo capture button
- Clean, minimal interface
- Responsive design

---

## Phase 7: Testing & Refinement (Days 15-16)

### 7.1 Functional Testing

**Test Cases:**
1. **Camera Access**
   - [ ] Webcam activates correctly
   - [ ] Video feed displays in mirror mode
   - [ ] Handles permission denial gracefully

2. **Face Tracking**
   - [ ] Face detected within 1 second
   - [ ] Landmarks track accurately across angles
   - [ ] Handles multiple faces (should track primary)
   - [ ] Recovers when face leaves frame

3. **Earring Overlay**
   - [ ] Earrings appear at correct ear positions
   - [ ] Scale is realistic (not too big/small)
   - [ ] Rotation matches head movement
   - [ ] Depth positioning looks natural

4. **Performance**
   - [ ] Maintains 30+ FPS consistently
   - [ ] No visible lag or stuttering
   - [ ] CPU usage < 50% on target hardware
   - [ ] Memory stable (no leaks)

5. **UI Functionality**
   - [ ] Jewelry selection changes models instantly
   - [ ] Snapshot saves correct image
   - [ ] Status indicators update in real-time

### 7.2 User Acceptance Testing

**Test with Real Users:**
- 5-10 people with different:
  - Face shapes
  - Skin tones
  - Hairstyles (long, short, covering ears)
  - Accessories (glasses, hats)

**Feedback Collection:**
- Tracking accuracy rating (1-10)
- Realism rating (1-10)
- Ease of use (1-10)
- Would you use this in a store? (Yes/No)

### 7.3 Bug Fixes & Polish

**Common Issues to Address:**
- Jittery/shaky overlay → Apply smoothing filter
- Earrings too far/close → Adjust Z-offset
- Wrong rotation → Recalibrate angle calculations
- Performance drops → Optimize processing pipeline

**Deliverables:**
- Test report with all cases passed
- User feedback summary
- Bug fixes implemented
- Polished, demo-ready POC

---

## Phase 8: Documentation & Demo (Days 17-18)

### 8.1 Documentation

**README.md:**
```markdown
# Jewelry AR Mirror - POC

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Access
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

## Features
- Real-time face tracking
- Earring overlay with realistic rendering
- Multiple jewelry styles
- Snapshot capture

## Tech Stack
- Backend: Python, MediaPipe, FastAPI, OpenCV
- Frontend: React, Three.js, WebSocket
- Models: GLTF/GLB format
```

**ARCHITECTURE.md:**
- System diagram
- Data flow explanation
- Component descriptions
- API documentation

**TROUBLESHOOTING.md:**
- Common issues and solutions
- Performance tuning tips
- Camera configuration

### 8.2 Demo Preparation

**Demo Script:**
1. Start backend server
2. Start frontend application
3. Allow camera access
4. Position face in frame
5. Show automatic earring placement
6. Switch between jewelry styles
7. Demonstrate head movement tracking
8. Capture snapshot
9. Show FPS and performance metrics

**Demo Video (Optional):**
- 2-3 minute walkthrough
- Show different users
- Highlight key features
- Include metrics overlay

**Deliverables:**
- Complete documentation
- Demo-ready application
- Demo script/video
- Stakeholder presentation slides

---

## Success Metrics for POC

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| FPS | 30+ | On-screen counter |
| Tracking Accuracy | 90%+ | User testing feedback |
| Latency | < 100ms | Timestamp comparison |
| Model Load Time | < 2s | Performance profiling |
| User Satisfaction | 8+/10 | Post-demo survey |
| Feature Completeness | 100% | Checklist completion |

---

## Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Low FPS performance | Use lower resolution, optimize MediaPipe settings, implement frame skipping |
| Inaccurate tracking | Use calibration UI, test with diverse users, implement smoothing |
| 3D model issues | Have backup procedural geometry, use simple models first |
| WebSocket connection drops | Implement automatic reconnection, add connection status UI |
| Poor lighting conditions | Add lighting detection, guide users to better positions |

---

## Next Steps After POC

1. **Expand Jewelry Types:** Necklaces, rings, nose piercings
2. **Enhance Realism:** PBR materials, dynamic lighting, shadows
3. **Multi-user Support:** Detect and track multiple faces
4. **Catalog System:** Database-driven jewelry library
5. **Electron Packaging:** Desktop application for kiosk deployment
6. **Analytics:** Track most-tried items, session duration
7. **Export Features:** Email/SMS snapshots, social sharing

---

## Timeline Summary

| Week | Phase | Deliverables |
|------|-------|-------------|
| Week 1 | Setup + Backend Core | Environment, face tracking, WebSocket server |
| Week 2 | Frontend + Integration | 3D rendering, UI, calibration |
| Week 3 | Testing + Documentation | Bug fixes, docs, demo |

---

## Team Roles (Recommended)

- **Backend Developer:** Python, MediaPipe, FastAPI (1 person)
- **Frontend Developer:** React, Three.js (1 person)
- **3D Artist/Designer:** Jewelry models, materials (1 person or outsource)
- **QA/Tester:** Testing, user feedback (0.5 person)

**Total:** 2-3 people for 2-3 weeks

---

## Budget Estimate (If Outsourcing 3D Models)

- Free 3D models: $0
- Basic commissioned models: $50-200 per model
- Premium models with textures: $200-500 per model

**POC Budget:** $0-500 (can use free models)

---

## Conclusion

This POC focuses on proving the core concept with minimal scope:
- ✅ Face tracking works reliably
- ✅ 3D overlay is realistic and performant
- ✅ User experience is intuitive
- ✅ Technical stack is viable

Upon successful POC completion, proceed with full implementation roadmap.
