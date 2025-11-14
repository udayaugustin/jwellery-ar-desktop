"""Configuration settings for the Jewelry AR Mirror backend."""
import os
from typing import Optional

class Config:
    """Application configuration."""

    # Camera settings
    CAMERA_ID: int = int(os.getenv("CAMERA_ID", "0"))
    CAMERA_WIDTH: int = int(os.getenv("CAMERA_WIDTH", "1280"))
    CAMERA_HEIGHT: int = int(os.getenv("CAMERA_HEIGHT", "720"))

    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # MediaPipe settings
    MAX_NUM_FACES: int = int(os.getenv("MAX_NUM_FACES", "1"))
    MIN_DETECTION_CONFIDENCE: float = float(os.getenv("MIN_DETECTION_CONFIDENCE", "0.5"))
    MIN_TRACKING_CONFIDENCE: float = float(os.getenv("MIN_TRACKING_CONFIDENCE", "0.5"))

    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

config = Config()
