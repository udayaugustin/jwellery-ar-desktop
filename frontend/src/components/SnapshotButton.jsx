import { useState } from 'react';

/**
 * SnapshotButton component allows users to capture a photo of their try-on.
 */
function SnapshotButton() {
  const [isCapturing, setIsCapturing] = useState(false);

  const captureSnapshot = () => {
    setIsCapturing(true);

    try {
      // Get the video element
      const video = document.querySelector('video');

      if (!video) {
        alert('Video not found. Please ensure camera is active.');
        setIsCapturing(false);
        return;
      }

      // Create a canvas to combine video and Three.js overlay
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');

      // Draw the video frame (mirrored to match display)
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Get Three.js canvas (the AR overlay)
      const threeCanvas = document.querySelector('canvas');

      if (threeCanvas) {
        // Draw the Three.js overlay on top
        ctx.drawImage(threeCanvas, 0, 0, canvas.width, canvas.height);
      }

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `jewelry-tryOn-${timestamp}.png`;
        link.href = url;
        link.click();

        // Cleanup
        URL.revokeObjectURL(url);
        setIsCapturing(false);

        // Visual feedback
        showFlash();
      });
    } catch (error) {
      console.error('Error capturing snapshot:', error);
      alert('Failed to capture snapshot. Please try again.');
      setIsCapturing(false);
    }
  };

  const showFlash = () => {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'white';
    flash.style.opacity = '0.8';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    flash.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(flash);

    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(flash);
      }, 300);
    }, 100);
  };

  return (
    <button
      onClick={captureSnapshot}
      disabled={isCapturing}
      style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        zIndex: 10,
        padding: '15px 25px',
        background: isCapturing
          ? 'rgba(76, 175, 80, 0.5)'
          : 'rgba(76, 175, 80, 0.9)',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        cursor: isCapturing ? 'not-allowed' : 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
      onMouseEnter={(e) => {
        if (!isCapturing) {
          e.target.style.background = 'rgba(76, 175, 80, 1)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isCapturing) {
          e.target.style.background = 'rgba(76, 175, 80, 0.9)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
        }
      }}
    >
      <span style={{ fontSize: '20px' }}>📸</span>
      <span>{isCapturing ? 'Capturing...' : 'Capture Photo'}</span>
    </button>
  );
}

export default SnapshotButton;
