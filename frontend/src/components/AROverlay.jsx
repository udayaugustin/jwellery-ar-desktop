import { Canvas } from '@react-three/fiber';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

/**
 * Simple earring component using Three.js primitives.
 * Creates a golden hoop earring for testing.
 */
function SimpleEarring({ position, rotation, scale = 1 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main hoop */}
      <mesh>
        <torusGeometry args={[0.015 * scale, 0.003 * scale, 16, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>

      {/* Small gem/decoration */}
      <mesh position={[0, -0.02 * scale, 0]}>
        <sphereGeometry args={[0.005 * scale, 16, 16]} />
        <meshStandardMaterial
          color="#FF6B9D"
          metalness={0.3}
          roughness={0.2}
          emissive="#FF1493"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

/**
 * AROverlay component renders 3D jewelry overlays using Three.js.
 */
function AROverlay({ landmarks, videoSize }) {
  const [leftEarPos, setLeftEarPos] = useState([0, 0, -5]);
  const [rightEarPos, setRightEarPos] = useState([0, 0, -5]);
  const [faceRotation, setFaceRotation] = useState([0, 0, 0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!landmarks || !landmarks.left_ear || !landmarks.right_ear) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    // Convert normalized MediaPipe coordinates to Three.js world space
    const leftEar = landmarks.left_ear;
    const rightEar = landmarks.right_ear;

    // MediaPipe coordinates are normalized (0-1)
    // Convert to Three.js coordinates (-aspect to +aspect for X, -1 to 1 for Y)
    const aspect = videoSize ? videoSize.width / videoSize.height : 16 / 9;

    // Mirror the X coordinate for correct left/right placement
    const leftX = -(leftEar.x * 2 - 1) * aspect;
    const leftY = -(leftEar.y * 2 - 1);
    const leftZ = leftEar.z * 2;

    const rightX = -(rightEar.x * 2 - 1) * aspect;
    const rightY = -(rightEar.y * 2 - 1);
    const rightZ = rightEar.z * 2;

    setLeftEarPos([leftX, leftY, leftZ]);
    setRightEarPos([rightX, rightY, rightZ]);

    // Apply face rotation if available
    if (landmarks.face_rotation) {
      const { pitch, yaw, roll } = landmarks.face_rotation;
      setFaceRotation([pitch, yaw, roll]);
    }
  }, [landmarks, videoSize]);

  return (
    <Canvas
      camera={{
        position: [0, 0, 2],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Lighting setup for realistic metallic appearance */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />
      <spotLight
        position={[0, 0, 10]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
      />

      {/* Earrings - only render when face is detected */}
      {isVisible && (
        <>
          {/* Left earring */}
          <SimpleEarring
            position={leftEarPos}
            rotation={[
              faceRotation[0] * 0.5,
              faceRotation[1] * 0.5,
              faceRotation[2],
            ]}
            scale={1.5}
          />

          {/* Right earring - mirrored */}
          <SimpleEarring
            position={rightEarPos}
            rotation={[
              faceRotation[0] * 0.5,
              Math.PI + faceRotation[1] * 0.5,
              -faceRotation[2],
            ]}
            scale={1.5}
          />
        </>
      )}
    </Canvas>
  );
}

export default AROverlay;
