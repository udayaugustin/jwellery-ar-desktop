import { useEffect, useRef, useState } from 'react';

/**
 * VideoFeed component displays the webcam feed as a background.
 * The video is mirrored horizontally to create a mirror effect.
 */
function VideoFeed({ onVideoReady }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream = null;

    async function setupCamera() {
      try {
        setIsLoading(true);

        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
            if (onVideoReady) {
              onVideoReady({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight,
              });
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Failed to access camera. Please grant camera permissions.');
        setIsLoading(false);
      }
    }

    setupCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [onVideoReady]);

  if (error) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          fontSize: '18px',
          padding: '20px',
          textAlign: 'center',
          zIndex: 0,
        }}
      >
        <div>
          <div style={{ marginBottom: '10px', fontSize: '48px' }}>📹</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '18px',
            zIndex: 1,
          }}
        >
          <div>
            <div style={{ marginBottom: '10px' }}>Loading camera...</div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror effect
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      />
    </>
  );
}

export default VideoFeed;
