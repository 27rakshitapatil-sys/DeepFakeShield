from transformers import pipeline


MODEL_NAME = "Smogy/SMOGY-Ai-images-detector"


classifier = pipeline(
    "image-classification",
    model=MODEL_NAME
)


def analyze_image(image):
    results = classifier(image)

    real_score = 0.0
    fake_score = 0.0

    for item in results:
        label = item["label"].lower()
        score = float(item["score"])

        if label in ["human", "real"]:
            real_score = score

        elif label in ["artificial", "fake", "ai", "ai-generated", "generated"]:
            fake_score = score

    # Safety fallback if the model returns unexpected labels
    if real_score == 0.0 and fake_score == 0.0:
        raise ValueError(
            f"Unexpected model labels: {results}"
        )

    return [
        {
            "label": "real",
            "score": real_score
        },
        {
            "label": "fake",
            "score": fake_score
        }
    ]