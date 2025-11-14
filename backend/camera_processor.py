"""Camera processing module for capturing and managing webcam frames."""
import cv2
import time
from typing import Optional, Tuple
import numpy as np


class CameraProcessor:
    """Handles webcam capture and frame processing."""

    def __init__(self, camera_id: int = 0, width: int = 1280, height: int = 720):
        """
        Initialize camera processor.

        Args:
            camera_id: Camera device ID (default: 0 for primary webcam)
            width: Frame width in pixels
            height: Frame height in pixels
        """
        self.camera_id = camera_id
        self.width = width
        self.height = height
        self.cap: Optional[cv2.VideoCapture] = None
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0.0

        self._initialize_camera()

    def _initialize_camera(self) -> None:
        """Initialize the camera with specified settings."""
        self.cap = cv2.VideoCapture(self.camera_id)

        if not self.cap.isOpened():
            raise RuntimeError(f"Failed to open camera {self.camera_id}")

        # Set camera properties
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        self.cap.set(cv2.CAP_PROP_FPS, 30)

        # Verify settings
        actual_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        actual_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

        print(f"Camera initialized: {actual_width}x{actual_height}")

    def capture_frame(self) -> Optional[np.ndarray]:
        """
        Capture a single frame from the camera.

        Returns:
            numpy.ndarray: The captured frame in BGR format, or None if capture failed
        """
        if self.cap is None or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()

        if not ret:
            print("Failed to capture frame")
            return None

        # Update FPS counter
        self._update_fps()

        return frame

    def _update_fps(self) -> None:
        """Update FPS calculation."""
        self.fps_counter += 1
        elapsed_time = time.time() - self.fps_start_time

        if elapsed_time >= 1.0:  # Update FPS every second
            self.current_fps = self.fps_counter / elapsed_time
            self.fps_counter = 0
            self.fps_start_time = time.time()

    def get_fps(self) -> float:
        """
        Get current FPS.

        Returns:
            float: Current frames per second
        """
        return self.current_fps

    def get_frame_size(self) -> Tuple[int, int]:
        """
        Get frame dimensions.

        Returns:
            tuple: (width, height) of frames
        """
        return self.width, self.height

    def release(self) -> None:
        """Release camera resources."""
        if self.cap is not None:
            self.cap.release()
            print("Camera released")

    def __del__(self):
        """Cleanup on object destruction."""
        self.release()
