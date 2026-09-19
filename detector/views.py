import os
import cv2

from PIL import Image
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .ai_models.deepfake_model import analyze_image


@api_view(["POST"])
def analyze_image_api(request):
    if "image" not in request.FILES:
        return Response(
            {"error": "No image uploaded."},
            status=status.HTTP_400_BAD_REQUEST
        )

    uploaded_image = request.FILES["image"]

    try:
        image = Image.open(uploaded_image).convert("RGB")

        results = analyze_image(image)

        fake_score = next(
            item["score"]
            for item in results
            if item["label"].lower() == "fake"
        )

        real_score = next(
            item["score"]
            for item in results
            if item["label"].lower() == "real"
        )

        prediction = "Fake" if fake_score > real_score else "Real"

        return Response(
            {
                "filename": uploaded_image.name,
                "prediction": prediction,
                "fake_probability": round(fake_score * 100, 2),
                "real_probability": round(real_score * 100, 2),
                "status": "analyzed"
            },
            status=status.HTTP_200_OK
        )

    except Exception as error:
        return Response(
            {"error": str(error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["POST"])
def analyze_video_api(request):
    if "video" not in request.FILES:
        return Response(
            {"error": "No video uploaded."},
            status=status.HTTP_400_BAD_REQUEST
        )

    uploaded_video = request.FILES["video"]

    video_path = f"temp_{uploaded_video.name}"

    try:
        # Save uploaded video temporarily
        with open(video_path, "wb+") as destination:
            for chunk in uploaded_video.chunks():
                destination.write(chunk)

        # Open video
        video = cv2.VideoCapture(video_path)

        if not video.isOpened():
            return Response(
                {"error": "Unable to open the video."},
                status=status.HTTP_400_BAD_REQUEST
            )

        total_frames = int(
            video.get(cv2.CAP_PROP_FRAME_COUNT)
        )

        if total_frames <= 0:
            video.release()

            return Response(
                {"error": "The video contains no readable frames."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Analyze up to 10 evenly distributed frames
        frame_count = min(10, total_frames)

        frame_positions = [
            int(
                i * (total_frames - 1)
                / max(frame_count - 1, 1)
            )
            for i in range(frame_count)
        ]

        fake_scores = []
        real_scores = []

        # Analyze selected frames
        for position in frame_positions:
            video.set(
                cv2.CAP_PROP_POS_FRAMES,
                position
            )

            success, frame = video.read()

            if not success:
                continue

            # OpenCV uses BGR, while PIL uses RGB
            frame_rgb = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            image = Image.fromarray(frame_rgb)

            # Use the existing deepfake image model
            results = analyze_image(image)

            fake_score = next(
                item["score"]
                for item in results
                if item["label"].lower() == "fake"
            )

            real_score = next(
                item["score"]
                for item in results
                if item["label"].lower() == "real"
            )

            fake_scores.append(fake_score)
            real_scores.append(real_score)

        video.release()

        if not fake_scores:
            return Response(
                {
                    "error": (
                        "Unable to extract readable frames "
                        "from the video."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate average probability across analyzed frames
        average_fake_score = (
            sum(fake_scores) / len(fake_scores)
        )

        average_real_score = (
            sum(real_scores) / len(real_scores)
        )

        # Final video prediction
        prediction = (
            "Fake"
            if average_fake_score > average_real_score
            else "Real"
        )

        return Response(
            {
                "filename": uploaded_video.name,
                "prediction": prediction,
                "fake_probability": round(
                    average_fake_score * 100,
                    2
                ),
                "real_probability": round(
                    average_real_score * 100,
                    2
                ),
                "frames_analyzed": len(fake_scores),
                "status": "analyzed"
            },
            status=status.HTTP_200_OK
        )

    except Exception as error:
        return Response(
            {"error": str(error)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    finally:
        # Remove temporary video file
        if os.path.exists(video_path):
            os.remove(video_path)