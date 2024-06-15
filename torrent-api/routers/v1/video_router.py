import asyncio
from fastapi import APIRouter, HTTPException, Response, status
from fastapi.responses import StreamingResponse
from qbittorrent import Client
import time
import logging
import cv2

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Video router"])

rtsp_stream_url = 'rtsp://Michiel:supersecretpassword@192.168.0.17'

@router.get("/camrechts")
async def get_camrechts(response: Response):
    # Open the RTSP stream
    cap = cv2.VideoCapture(rtsp_stream_url)

    async def generate():
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Convert the frame to JPEG format
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # Yield the frame in a format suitable for streaming
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    return StreamingResponse(generate(), media_type="multipart/x-mixed-replace;boundary=frame")

async def capture_frame(rtsp_stream_url):
    cap = cv2.VideoCapture(rtsp_stream_url)
    if not cap.isOpened():
        print(f"Failed to open RTSP stream: {rtsp_stream_url}")
        return None

    # Skip first few frames to stabilize stream
    for _ in range(10):
        cap.read()

    ret, frame = cap.read()
    if not ret:
        print("Failed to read frame from RTSP stream")
        return None

    ret, buffer = cv2.imencode('.jpg', frame)
    if not ret:
        print("Failed to encode frame as JPEG")
        return None

    return buffer.tobytes()


@router.get("/video_feed")
async def video_feed(response: Response):
    response.headers["Content-Type"] = "image/jpeg"

    # Function to capture frame and return it as JPEG bytes
    async def fetch_image():
        while True:
            frame_bytes = await capture_frame(rtsp_stream_url)
            if frame_bytes:
                yield frame_bytes
            await asyncio.sleep(1)  # Wait for 1 second before capturing next frame

    return StreamingResponse(fetch_image())

@router.get("/take_screenshot", response_class=Response)
async def take_screenshot():

    # Capture a frame and encode as JPEG
    frame_bytes = await capture_frame(rtsp_stream_url)
    if frame_bytes:
        return StreamingResponse(iter([frame_bytes]), media_type="image/jpeg")

    return Response(status_code=500, content="Failed to capture screenshot")
