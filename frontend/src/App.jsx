import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setError("");

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/analyze/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        "Unable to analyze the image. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedVideo(file);
    setVideoResult(null);
    setVideoError("");
  };

  const handleAnalyzeVideo = async () => {
    if (!selectedVideo) {
      setVideoError("Please select a video first.");
      return;
    }

    setVideoLoading(true);
    setVideoError("");
    setVideoResult(null);

    const formData = new FormData();
    formData.append("video", selectedVideo);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/analyze-video/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setVideoResult(response.data);
    } catch (err) {
      setVideoError(
        "Unable to analyze the video. Make sure Django is running."
      );
    } finally {
      setVideoLoading(false);
    }
  };

  const resetImageAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const resetVideoAnalysis = () => {
    setSelectedVideo(null);
    setVideoResult(null);
    setVideoError("");
  };

  const getProbabilityLevel = (fakeProbability) => {
    if (fakeProbability < 20) {
      return "Low";
    }

    if (fakeProbability < 50) {
      return "Moderate";
    }

    return "High";
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Deepfake Shield</h1>

        <p>
          AI-powered image and video authenticity analysis
        </p>
      </header>

      <main className="container">

        {/* =========================
            IMAGE ANALYSIS
        ========================= */}

        <div className="upload-card">
          <h2>Analyze an Image</h2>

          <p className="description">
            Upload an image and let the AI model estimate whether it appears
            real or AI-generated.
          </p>

          <label className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />

            <span className="upload-icon">
              +
            </span>

            <span className="upload-title">
              {selectedFile
                ? selectedFile.name
                : "Choose an image"}
            </span>

            <span className="upload-text">
              JPG, JPEG or PNG
            </span>
          </label>

          {preview && (
            <div className="preview-section">
              <h3>
                Selected Image
              </h3>

              <img
                src={preview}
                alt="Preview"
                className="preview-image"
              />
            </div>
          )}

          <button
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Image"}
          </button>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {result && (
            <div className="result-card">

              <h2>
                Analysis Result
              </h2>

              <div
                className={`prediction ${
                  result.prediction.toLowerCase() === "fake"
                    ? "fake"
                    : "real"
                }`}
              >
                {result.prediction}
              </div>

              <div className="probabilities">

                <div>
                  <span>
                    Real Probability
                  </span>

                  <strong>
                    {result.real_probability}%
                  </strong>
                </div>

                <div>
                  <span>
                    Fake Probability
                  </span>

                  <strong>
                    {result.fake_probability}%
                  </strong>
                </div>

              </div>

              <div className="confidence-section">

                <div className="confidence-header">

                  <span>
                    AI-generated probability
                  </span>

                  <strong>
                    {result.fake_probability}%
                  </strong>

                </div>

                <div className="confidence-bar">

                  <div
                    className="confidence-fill"
                    style={{
                      width: `${result.fake_probability}%`,
                    }}
                  ></div>

                </div>

                <p className="probability-level">

                  Probability level:{" "}

                  <strong>
                    {getProbabilityLevel(
                      result.fake_probability
                    )}
                  </strong>

                </p>

              </div>

              <p className="disclaimer">
                This result is an AI-based probability estimate and should not
                be treated as definitive proof of authenticity.
              </p>

              <button
                className="reset-button"
                onClick={resetImageAnalysis}
              >
                Analyze Another Image
              </button>

            </div>
          )}
        </div>

        {/* =========================
            VIDEO ANALYSIS
        ========================= */}

        <div className="upload-card video-card">

          <h2>
            Analyze a Video
          </h2>

          <p className="description">
            Upload a video and Deepfake Shield will analyze selected frames
            using the AI deepfake detection model.
          </p>

          <label className="upload-box">

            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
            />

            <span className="upload-icon">
              +
            </span>

            <span className="upload-title">

              {selectedVideo
                ? selectedVideo.name
                : "Choose a video"}

            </span>

            <span className="upload-text">
              MP4, MOV, AVI or other supported video formats
            </span>

          </label>

          <button
            className="analyze-button"
            onClick={handleAnalyzeVideo}
            disabled={videoLoading}
          >
            {videoLoading
              ? "Analyzing Video..."
              : "Analyze Video"}
          </button>

          {videoError && (
            <p className="error-message">
              {videoError}
            </p>
          )}

          {videoResult && (
            <div className="result-card">

              <h2>
                Video Analysis Result
              </h2>

              <div
                className={`prediction ${
                  videoResult.prediction.toLowerCase() === "fake"
                    ? "fake"
                    : "real"
                }`}
              >
                {videoResult.prediction}
              </div>

              <div className="probabilities">

                <div>
                  <span>
                    Real Probability
                  </span>

                  <strong>
                    {videoResult.real_probability}%
                  </strong>
                </div>

                <div>
                  <span>
                    Fake Probability
                  </span>

                  <strong>
                    {videoResult.fake_probability}%
                  </strong>
                </div>

              </div>

              <div className="confidence-section">

                <div className="confidence-header">

                  <span>
                    AI-generated probability
                  </span>

                  <strong>
                    {videoResult.fake_probability}%
                  </strong>

                </div>

                <div className="confidence-bar">

                  <div
                    className="confidence-fill"
                    style={{
                      width: `${videoResult.fake_probability}%`,
                    }}
                  ></div>

                </div>

                <p className="probability-level">

                  Probability level:{" "}

                  <strong>
                    {getProbabilityLevel(
                      videoResult.fake_probability
                    )}
                  </strong>

                </p>

              </div>

              {/* =========================
                  FRAMES ANALYZED
              ========================= */}

              <p className="frames-analyzed">

                Frames analyzed:{" "}

                <strong>
                  {videoResult.frames_analyzed}
                </strong>

              </p>

              {/* =========================
                  FRAME-BY-FRAME ANALYSIS
              ========================= */}

              {videoResult.frame_analysis &&
                videoResult.frame_analysis.length > 0 && (

                  <div className="frame-analysis">

                    <h3>
                      Frame-by-Frame Analysis
                    </h3>

                    <div className="frame-analysis-list">

                      {videoResult.frame_analysis.map(
                        (frame) => (

                          <div
                            className={`frame-item ${
                              frame.prediction.toLowerCase() === "fake"
                                ? "frame-fake"
                                : "frame-real"
                            }`}
                            key={frame.frame_number}
                          >

                            <div className="frame-info">

                              <strong>
                                Frame {frame.frame_number}
                              </strong>

                              <span>
                                {frame.prediction}
                              </span>

                            </div>

                            <div className="frame-probabilities">

                              <span>
                                Real:{" "}
                                {frame.real_probability}%
                              </span>

                              <span>
                                Fake:{" "}
                                {frame.fake_probability}%
                              </span>

                              <strong>
                                Confidence:{" "}
                                {frame.confidence}%
                              </strong>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              <p className="disclaimer">

                This result is an AI-based probability estimate from
                selected video frames and should not be treated as
                definitive proof of authenticity.

              </p>

              <button
                className="reset-button"
                onClick={resetVideoAnalysis}
              >
                Analyze Another Video
              </button>

            </div>
          )}

        </div>

      </main>
    </div>
  );
}

export default App;