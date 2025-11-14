import { useState, useEffect } from 'react';
import VideoFeed from './components/VideoFeed';
import AROverlay from './components/AROverlay';
import JewelrySelector from './components/JewelrySelector';
import SnapshotButton from './components/SnapshotButton';
import LandmarkWebSocket from './services/websocket';

/**
 * Main App component for the Jewelry AR Mirror.
 */
function App() {
  const [landmarks, setLandmarks] = useState(null);
  const [fps, setFps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [videoSize, setVideoSize] = useState(null);
  const [selectedJewelry, setSelectedJewelry] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new LandmarkWebSocket('ws://localhost:8000/ws/landmarks');

    // Handle connection status
    ws.on('connected', (status) => {
      setIsConnected(status);
      if (status) {
        setBackendError(null);
      }
    });

    // Handle landmark data
    ws.on('landmarks', (data) => {
      if (data.error) {
        console.error('Backend error:', data.error);
        setBackendError(data.error);
        return;
      }

      setLandmarks(data.landmarks || null);
      setFps(data.fps || 0);
      setFaceDetected(data.face_detected || false);
      setBackendError(null);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle max reconnection attempts
    ws.on('maxReconnectAttemptsReached', () => {
      setBackendError(
        'Cannot connect to backend server. Please ensure the backend is running on http://localhost:8000'
      );
    });

    // Connect to WebSocket
    ws.connect();

    // Cleanup on unmount
    return () => {
      ws.disconnect();
    };
  }, []);

  const handleVideoReady = (size) => {
    setVideoSize(size);
  };

  const handleJewelrySelect = (jewelry) => {
    setSelectedJewelry(jewelry);
    console.log('Selected jewelry:', jewelry);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* Video feed (background layer) */}
      <VideoFeed onVideoReady={handleVideoReady} />

      {/* AR Overlay (Three.js layer) */}
      <AROverlay landmarks={landmarks} videoSize={videoSize} />

      {/* Status overlay (top-left) */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          fontSize: '14px',
          fontFamily: 'monospace',
          backdropFilter: 'blur(10px)',
          minWidth: '200px',
        }}
      >
        <div style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          Jewelry AR Mirror
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '5px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#4CAF50' : '#F44336',
            }}
          />
          <span>Backend: {isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '5px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: faceDetected ? '#4CAF50' : '#FFC107',
            }}
          />
          <span>Face: {faceDetected ? 'Detected' : 'Not Detected'}</span>
        </div>
        <div>FPS: {fps.toFixed(1)}</div>
        {selectedJewelry && (
          <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
            Style: {selectedJewelry.name}
          </div>
        )}
      </div>

      {/* Error message */}
      {backendError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
            backgroundColor: 'rgba(244, 67, 54, 0.95)',
            color: 'white',
            padding: '30px 40px',
            borderRadius: '15px',
            fontSize: '16px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Backend Error
          </div>
          <div>{backendError}</div>
        </div>
      )}

      {/* No face detected message */}
      {isConnected && !faceDetected && !backendError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            backgroundColor: 'rgba(255, 193, 7, 0.9)',
            color: '#333',
            padding: '20px 30px',
            borderRadius: '12px',
            fontSize: '16px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>👤</div>
          <div>Position your face in the camera view</div>
        </div>
      )}

      {/* Snapshot button (top-right) */}
      {isConnected && faceDetected && <SnapshotButton />}

      {/* Jewelry selector (bottom-center) */}
      {isConnected && (
        <JewelrySelector
          onSelect={handleJewelrySelect}
          currentSelection={selectedJewelry}
        />
      )}

      {/* Instructions overlay (bottom-left) */}
      {isConnected && faceDetected && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '20px',
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            maxWidth: '250px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            How to use:
          </div>
          <div style={{ lineHeight: '1.6' }}>
            • Select a jewelry style below
            <br />
            • Move your head to see different angles
            <br />
            • Click "Capture Photo" to save
            <br />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
