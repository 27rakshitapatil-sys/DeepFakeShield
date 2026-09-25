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

  // =========================
  // ANALYSIS HISTORY
  // =========================

  const [analysisHistory, setAnalysisHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem("deepfakeShieldHistory");
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      return [];
    }
  });

  // =========================
  // IMAGE FILE CHANGE
  // =========================

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedFile(file);
    setResult(null);
    setError("");

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  // =========================
  // IMAGE ANALYSIS
  // =========================

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

      // Save completed image analysis to history
      saveAnalysisToHistory(
        "Image",
        selectedFile.name,
        response.data
      );
    } catch (err) {
      setError(
        "Unable to analyze the image. Make sure Django is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VIDEO FILE CHANGE
  // =========================

  const handleVideoChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedVideo(file);
    setVideoResult(null);
    setVideoError("");
  };

  // =========================
  // VIDEO ANALYSIS
  // =========================

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

      // Save completed video analysis to history
      saveAnalysisToHistory(
        "Video",
        selectedVideo.name,
        response.data
      );
    } catch (err) {
      setVideoError(
        "Unable to analyze the video. Make sure Django is running."
      );
    } finally {
      setVideoLoading(false);
    }
  };

  // =========================
  // RESET IMAGE ANALYSIS
  // =========================

  const resetImageAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  // =========================
  // RESET VIDEO ANALYSIS
  // =========================

  const resetVideoAnalysis = () => {
    setSelectedVideo(null);
    setVideoResult(null);
    setVideoError("");
  };

  // =========================
  // PROBABILITY LEVEL
  // =========================

  const getProbabilityLevel = (fakeProbability) => {
    if (fakeProbability < 20) {
      return "Low";
    }

    if (fakeProbability < 50) {
      return "Moderate";
    }

    return "High";
  };

  // =========================
  // SAVE ANALYSIS TO HISTORY
  // =========================

  const saveAnalysisToHistory = (type, fileName, analysisResult) => {
    const historyItem = {
      id: Date.now(),
      type,
      fileName,
      prediction: analysisResult.prediction,
      real_probability: analysisResult.real_probability,
      fake_probability: analysisResult.fake_probability,
      forensic_score:
        type === "Video"
          ? analysisResult.forensic_score ?? null
          : null,
      timestamp: new Date().toLocaleString(),
    };

    setAnalysisHistory((previousHistory) => {
      const updatedHistory = [historyItem, ...previousHistory];

      localStorage.setItem(
        "deepfakeShieldHistory",
        JSON.stringify(updatedHistory)
      );

      return updatedHistory;
    });
  };

  // =========================
  // CLEAR HISTORY
  // =========================

  const clearHistory = () => {
    localStorage.removeItem("deepfakeShieldHistory");
    setAnalysisHistory([]);
  };

  return (
    <div className="app">

      {/* =========================
          HEADER
      ========================= */}

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
                  VIDEO FORENSIC SUMMARY
              ========================= */}

              <div className="video-forensic-summary">

                <div className="forensic-item">
                  <span>
                    Video Duration
                  </span>

                  <strong>
                    {videoResult.video_duration}s
                  </strong>
                </div>

                <div className="forensic-item">
                  <span>
                    Frames Analyzed
                  </span>

                  <strong>
                    {videoResult.frames_analyzed}
                  </strong>
                </div>

                <div className="forensic-item">
                  <span>
                    Suspicious Frames
                  </span>

                  <strong>
                    {videoResult.suspicious_frames}
                  </strong>
                </div>

                <div className="forensic-item">
                  <span>
                    Suspicious Portion
                  </span>

                  <strong>
                    {videoResult.suspicious_percentage}%
                  </strong>
                </div>

                {/* TEMPORAL CONSISTENCY */}

                <div className="forensic-item">
                  <span>
                    Temporal Consistency
                  </span>

                  <strong>
                    {videoResult.temporal_consistency !== undefined
                      ? `${(videoResult.temporal_consistency * 100).toFixed(2)}%`
                      : "N/A"}
                  </strong>
                </div>

                {/* FORENSIC SCORE */}

                <div className="forensic-item">
                  <span>
                    Forensic Score
                  </span>

                  <strong>
                    {videoResult.forensic_score !== undefined
                      ? `${videoResult.forensic_score}%`
                      : "N/A"}
                  </strong>
                </div>

                {/* FORENSIC ASSESSMENT */}

                <div className="forensic-item">
                  <span>
                    Assessment
                  </span>

                  <strong>
                    {videoResult.forensic_assessment || "N/A"}
                  </strong>
                </div>

              </div>

              {/* =========================
                  FORENSIC VISUALIZATION
              ========================= */}

              <div className="forensic-visualization">

                <h3>Forensic Visualization</h3>

                <div className="forensic-metric">

                  <div className="forensic-metric-header">

                    <span>
                      AI Fake Probability
                    </span>

                    <strong>
                      {videoResult.fake_probability}%
                    </strong>

                  </div>

                  <div className="forensic-metric-bar">

                    <div
                      className="forensic-metric-fill fake-probability-fill"
                      style={{
                        width: `${videoResult.fake_probability}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <div className="forensic-metric">

                  <div className="forensic-metric-header">

                    <span>
                      Temporal Consistency
                    </span>

                    <strong>
                      {videoResult.temporal_consistency !== undefined
                        ? `${(videoResult.temporal_consistency * 100).toFixed(2)}%`
                        : "N/A"}
                    </strong>

                  </div>

                  <div className="forensic-metric-bar">

                    <div
                      className="forensic-metric-fill temporal-fill"
                      style={{
                        width: `${
                          videoResult.temporal_consistency !== undefined
                            ? videoResult.temporal_consistency * 100
                            : 0
                        }%`,
                      }}
                    ></div>

                  </div>

                </div>

                <div className="forensic-metric">

                  <div className="forensic-metric-header">

                    <span>
                      Suspicious Portion
                    </span>

                    <strong>
                      {videoResult.suspicious_percentage}%
                    </strong>

                  </div>

                  <div className="forensic-metric-bar">

                    <div
                      className="forensic-metric-fill suspicious-fill"
                      style={{
                        width: `${videoResult.suspicious_percentage}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <div className="forensic-metric">

                  <div className="forensic-metric-header">

                    <span>
                      Forensic Score
                    </span>

                    <strong>
                      {videoResult.forensic_score !== undefined
                        ? `${videoResult.forensic_score}%`
                        : "N/A"}
                    </strong>

                  </div>

                  <div className="forensic-metric-bar">

                    <div
                      className="forensic-metric-fill forensic-score-fill"
                      style={{
                        width: `${
                          videoResult.forensic_score !== undefined
                            ? videoResult.forensic_score
                            : 0
                        }%`,
                      }}
                    ></div>

                  </div>

                </div>

              </div>

              {/* =========================
                  SUSPICIOUS TIMELINE
              ========================= */}

              {videoResult.suspicious_segments &&
                videoResult.suspicious_segments.length > 0 && (

                  <div className="suspicious-timeline">

                    <h3>
                      Suspicious Timeline
                    </h3>

                    <div className="timeline-bar">

                      {videoResult.suspicious_segments.map(
                        (segment, index) => {

                          const startSeconds =
                            segment.start_seconds ?? 0;

                          const duration =
                            videoResult.video_duration > 0
                              ? (segment.duration /
                                  videoResult.video_duration) *
                                100
                              : 0;

                          const left =
                            videoResult.video_duration > 0
                              ? (startSeconds /
                                  videoResult.video_duration) *
                                100
                              : 0;

                          return (
                            <div
                              key={index}
                              className="timeline-segment"
                              style={{
                                left: `${left}%`,
                                width: `${Math.max(duration, 2)}%`,
                              }}
                              title={`${segment.start} - ${segment.end}`}
                            ></div>
                          );
                        }
                      )}

                    </div>

                    <div className="timeline-labels">

                      <span>
                        00:00
                      </span>

                      <span>
                        {videoResult.video_duration}s
                      </span>

                    </div>

                    <div className="suspicious-segment-list">

                      {videoResult.suspicious_segments.map(
                        (segment, index) => (

                          <div
                            className="suspicious-segment"
                            key={index}
                          >

                            <strong>
                              Suspicious Segment {index + 1}
                            </strong>

                            <span>
                              {segment.start} → {segment.end}
                            </span>

                            <span>
                              Duration: {segment.duration}s
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

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
                                Timestamp:{" "}
                                {frame.timestamp}
                              </span>

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

        {/* =========================
            ANALYSIS HISTORY
        ========================= */}

        {analysisHistory.length > 0 && (

          <section className="history-section">

            <div className="section-heading">

              <div>

                <span>ANALYSIS HISTORY</span>

                <h2>
                  Previous Analyses
                </h2>

              </div>

              <button
                className="clear-history-btn"
                onClick={clearHistory}
              >
                Clear History
              </button>

            </div>

            <div className="history-list">

              {analysisHistory.map((item) => (

                <div
                  className="history-card"
                  key={item.id}
                >

                  <div className="history-icon">
                    {item.type === "Image"
                      ? "🖼️"
                      : "🎥"}
                  </div>

                  <div className="history-info">

                    <strong>
                      {item.fileName}
                    </strong>

                    <span>
                      {item.type === "Image"
                        ? "Image Analysis"
                        : "Video Analysis"}
                    </span>

                    <small>
                      {item.timestamp}
                    </small>

                  </div>

                  <div className="history-details">

                    <div className="history-detail">

                      <span>
                        Result
                      </span>

                      <strong
                        className={
                          item.prediction?.toLowerCase() === "fake"
                            ? "history-fake"
                            : "history-real"
                        }
                      >
                        {item.prediction || "Analyzed"}
                      </strong>

                    </div>

                    <div className="history-detail">

                      <span>
                        AI Probability
                      </span>

                      <strong>
                        {item.fake_probability !== undefined &&
                        item.fake_probability !== null
                          ? `${item.fake_probability}%`
                          : "N/A"}
                      </strong>

                    </div>

                    {item.type === "Video" && (

                      <div className="history-detail">

                        <span>
                          Forensic Score
                        </span>

                        <strong>
                          {item.forensic_score !== undefined &&
                          item.forensic_score !== null
                            ? `${item.forensic_score}%`
                            : "N/A"}
                        </strong>

                      </div>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;