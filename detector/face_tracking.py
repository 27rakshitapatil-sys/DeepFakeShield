import cv2
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


MODEL_PATH = "models/blaze_face_short_range.tflite"


# Create the MediaPipe face detector once.
base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.FaceDetectorOptions(
    base_options=base_options,
    min_detection_confidence=0.1
)

face_detector = vision.FaceDetector.create_from_options(options)


def detect_face(frame):
    """
    Detect the largest face in an OpenCV frame.

    Returns:
        (x, y, w, h) if a face is detected.
        None otherwise.
    """

    if frame is None:
        return None

    height, width = frame.shape[:2]

    # OpenCV uses BGR; MediaPipe expects RGB.
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(
        image_format=mp.ImageFormat.SRGB,
        data=rgb_frame
    )

    result = face_detector.detect(mp_image)

    if not result.detections:
        return None

    # Select the largest detected face.
    largest_detection = max(
        result.detections,
        key=lambda detection: (
            detection.bounding_box.width
            * detection.bounding_box.height
        )
    )

    bbox = largest_detection.bounding_box

    x = max(0, int(bbox.origin_x))
    y = max(0, int(bbox.origin_y))
    w = int(bbox.width)
    h = int(bbox.height)

    # Keep the bounding box inside the frame.
    w = min(w, width - x)
    h = min(h, height - y)

    return x, y, w, h


def calculate_temporal_consistency(face_positions):
    """
    Calculate temporal consistency of face movement.

    face_positions:
        List of (x, y, w, h) tuples.
        None values represent frames where no face was detected.

    Returns:
        Consistency score between 0 and 1.
    """

    valid_positions = [
        position
        for position in face_positions
        if position is not None
    ]

    if len(valid_positions) < 2:
        return 1.0

    movements = []

    for previous, current in zip(
        valid_positions,
        valid_positions[1:]
    ):
        px, py, pw, ph = previous
        cx, cy, cw, ch = current

        previous_center = (
            px + pw / 2,
            py + ph / 2
        )

        current_center = (
            cx + cw / 2,
            cy + ch / 2
        )

        movement = (
            (current_center[0] - previous_center[0]) ** 2
            + (current_center[1] - previous_center[1]) ** 2
        ) ** 0.5

        movements.append(movement)

    if not movements:
        return 1.0

    average_movement = sum(movements) / len(movements)

    consistency = 1 / (1 + average_movement / 50)

    return round(
        max(0.0, min(1.0, consistency)),
        4
    )