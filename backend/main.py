"""FastAPI server with WebSocket for real-time landmark streaming."""
import asyncio
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from camera_processor import CameraProcessor
from landmark_extractor import LandmarkExtractor
from config import config


app = FastAPI(title="Jewelry AR Mirror API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Jewelry AR Mirror API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": time.time(),
    }


@app.websocket("/ws/landmarks")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for streaming facial landmarks in real-time.

    The client receives JSON messages with the following structure:
    {
        "timestamp": float,
        "landmarks": {
            "left_ear": {"x": float, "y": float, "z": float},
            "right_ear": {"x": float, "y": float, "z": float},
            "face_rotation": {"pitch": float, "yaw": float, "roll": float},
            "nose_tip": {"x": float, "y": float, "z": float}
        },
        "fps": float,
        "frame_count": int
    }
    """
    await websocket.accept()
    print(f"WebSocket client connected: {websocket.client}")

    camera = None
    extractor = None
    frame_count = 0

    try:
        # Initialize camera and landmark extractor
        camera = CameraProcessor(
            camera_id=config.CAMERA_ID,
            width=config.CAMERA_WIDTH,
            height=config.CAMERA_HEIGHT,
        )

        extractor = LandmarkExtractor(
            max_num_faces=config.MAX_NUM_FACES,
            min_detection_confidence=config.MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=config.MIN_TRACKING_CONFIDENCE,
        )

        print("Camera and MediaPipe initialized successfully")

        # Main processing loop
        while True:
            try:
                # Capture frame
                frame = camera.capture_frame()

                if frame is None:
                    await websocket.send_json(
                        {
                            "error": "Failed to capture frame",
                            "timestamp": time.time(),
                        }
                    )
                    await asyncio.sleep(0.033)  # ~30 FPS
                    continue

                # Extract landmarks
                landmarks = extractor.extract_landmarks(frame)

                frame_count += 1

                # Prepare response
                response = {
                    "timestamp": time.time(),
                    "fps": camera.get_fps(),
                    "frame_count": frame_count,
                }

                if landmarks:
                    response["landmarks"] = {
                        "left_ear": landmarks["left_ear"],
                        "right_ear": landmarks["right_ear"],
                        "face_rotation": landmarks["face_rotation"],
                        "nose_tip": landmarks["nose_tip"],
                    }
                    response["face_detected"] = True
                else:
                    response["face_detected"] = False
                    response["message"] = "No face detected"

                # Send to client
                await websocket.send_json(response)

                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.001)

            except WebSocketDisconnect:
                print("Client disconnected")
                break
            except Exception as e:
                print(f"Error in processing loop: {e}")
                await websocket.send_json(
                    {
                        "error": str(e),
                        "timestamp": time.time(),
                    }
                )
                await asyncio.sleep(0.033)

    except Exception as e:
        print(f"Error in WebSocket connection: {e}")
        await websocket.send_json(
            {
                "error": f"Server error: {str(e)}",
                "timestamp": time.time(),
            }
        )

    finally:
        # Cleanup
        if camera:
            camera.release()
        if extractor:
            extractor.release()
        print(f"WebSocket connection closed. Total frames processed: {frame_count}")


def main():
    """Run the FastAPI server."""
    print(f"Starting Jewelry AR Mirror API server...")
    print(f"Backend server will run on http://{config.HOST}:{config.PORT}")
    print(f"WebSocket endpoint: ws://{config.HOST}:{config.PORT}/ws/landmarks")
    print(f"Health check: http://{config.HOST}:{config.PORT}/health")

    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=False,  # Set to True for development
        log_level="info",
    )


if __name__ == "__main__":
    main()
