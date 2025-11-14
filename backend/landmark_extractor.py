"""Landmark extraction module using MediaPipe Face Mesh."""
import mediapipe as mp
import numpy as np
from typing import Optional, Dict, List
import math


class LandmarkExtractor:
    """Extracts facial landmarks using MediaPipe Face Mesh."""

    # MediaPipe landmark indices for jewelry placement
    # Ear landmarks
    LEFT_EAR_TOP = 234
    LEFT_EAR_BOTTOM = 454
    RIGHT_EAR_TOP = 127
    RIGHT_EAR_BOTTOM = 356

    # Face landmarks for orientation
    NOSE_TIP = 4
    CHIN = 152
    FOREHEAD = 10
    LEFT_EYE = 33
    RIGHT_EYE = 263

    def __init__(
        self,
        max_num_faces: int = 1,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
    ):
        """
        Initialize MediaPipe Face Mesh.

        Args:
            max_num_faces: Maximum number of faces to detect
            min_detection_confidence: Minimum confidence for face detection
            min_tracking_confidence: Minimum confidence for landmark tracking
        """
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=max_num_faces,
            refine_landmarks=True,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def extract_landmarks(self, frame: np.ndarray) -> Optional[Dict]:
        """
        Extract facial landmarks from a frame.

        Args:
            frame: Input frame in BGR format

        Returns:
            dict: Dictionary containing landmark positions and face rotation, or None if no face detected
        """
        if frame is None:
            return None

        # Convert BGR to RGB
        rgb_frame = frame[:, :, ::-1]

        # Process the frame
        results = self.face_mesh.process(rgb_frame)

        if not results.multi_face_landmarks:
            return None

        # Get the first face (primary face)
        face_landmarks = results.multi_face_landmarks[0]

        # Extract ear positions
        left_ear = self._get_ear_position(face_landmarks, is_left=True)
        right_ear = self._get_ear_position(face_landmarks, is_left=False)

        # Calculate face rotation
        face_rotation = self._calculate_head_rotation(face_landmarks)

        return {
            "left_ear": left_ear,
            "right_ear": right_ear,
            "face_rotation": face_rotation,
            "nose_tip": self._get_landmark_position(face_landmarks, self.NOSE_TIP),
            "all_landmarks": self._get_all_landmarks(face_landmarks),
        }

    def _get_ear_position(
        self, face_landmarks, is_left: bool = True
    ) -> Dict[str, float]:
        """
        Get ear position by averaging top and bottom ear landmarks.

        Args:
            face_landmarks: MediaPipe face landmarks
            is_left: True for left ear, False for right ear

        Returns:
            dict: Ear position with x, y, z coordinates
        """
        if is_left:
            top_idx = self.LEFT_EAR_TOP
            bottom_idx = self.LEFT_EAR_BOTTOM
        else:
            top_idx = self.RIGHT_EAR_TOP
            bottom_idx = self.RIGHT_EAR_BOTTOM

        top = face_landmarks.landmark[top_idx]
        bottom = face_landmarks.landmark[bottom_idx]

        # Average position for more stable placement
        return {
            "x": (top.x + bottom.x) / 2,
            "y": (top.y + bottom.y) / 2,
            "z": (top.z + bottom.z) / 2,
        }

    def _get_landmark_position(self, face_landmarks, index: int) -> Dict[str, float]:
        """Get position of a specific landmark."""
        landmark = face_landmarks.landmark[index]
        return {"x": landmark.x, "y": landmark.y, "z": landmark.z}

    def _calculate_head_rotation(self, face_landmarks) -> Dict[str, float]:
        """
        Calculate head rotation (pitch, yaw, roll) from facial landmarks.

        Args:
            face_landmarks: MediaPipe face landmarks

        Returns:
            dict: Rotation angles in radians
        """
        # Get key landmarks
        nose = face_landmarks.landmark[self.NOSE_TIP]
        chin = face_landmarks.landmark[self.CHIN]
        forehead = face_landmarks.landmark[self.FOREHEAD]
        left_eye = face_landmarks.landmark[self.LEFT_EYE]
        right_eye = face_landmarks.landmark[self.RIGHT_EYE]

        # Calculate pitch (up/down tilt)
        # Positive = looking up, Negative = looking down
        pitch = math.atan2(forehead.y - chin.y, forehead.z - chin.z)

        # Calculate yaw (left/right turn)
        # Positive = turned right, Negative = turned left
        eye_center_x = (left_eye.x + right_eye.x) / 2
        yaw = (nose.x - eye_center_x) * 2  # Scale for more sensitivity

        # Calculate roll (head tilt)
        # Positive = tilted right, Negative = tilted left
        roll = math.atan2(right_eye.y - left_eye.y, right_eye.x - left_eye.x)

        return {"pitch": pitch, "yaw": yaw, "roll": roll}

    def _get_all_landmarks(self, face_landmarks) -> List[Dict[str, float]]:
        """
        Get all facial landmarks.

        Args:
            face_landmarks: MediaPipe face landmarks

        Returns:
            list: List of all landmark positions
        """
        landmarks = []
        for landmark in face_landmarks.landmark:
            landmarks.append({"x": landmark.x, "y": landmark.y, "z": landmark.z})
        return landmarks

    def release(self) -> None:
        """Release MediaPipe resources."""
        if hasattr(self, "face_mesh"):
            self.face_mesh.close()
            print("MediaPipe Face Mesh released")

    def __del__(self):
        """Cleanup on object destruction."""
        self.release()
