import { useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
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

  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("All");
  const [historyPredictionFilter, setHistoryPredictionFilter] = useState("All");

  const filteredHistory = analysisHistory.filter((item) => {
    const matchesSearch = item.fileName
      ?.toLowerCase()
      .includes(historySearch.toLowerCase());

    const matchesType =
      historyTypeFilter === "All" || item.type === historyTypeFilter;

    const matchesPrediction =
      historyPredictionFilter === "All" ||
      item.prediction?.toLowerCase() === historyPredictionFilter.toLowerCase();

    return matchesSearch && matchesType && matchesPrediction;
  });

  // =========================
  // ANALYTICS DASHBOARD
  // =========================

  const analytics = {
    total: analysisHistory.length,
    images: analysisHistory.filter((item) => item.type === "Image").length,
    videos: analysisHistory.filter((item) => item.type === "Video").length,
    real: analysisHistory.filter(
      (item) => item.prediction?.toLowerCase() === "real"
    ).length,
    fake: analysisHistory.filter(
      (item) => item.prediction?.toLowerCase() === "fake"
    ).length,
    averageFakeProbability:
      analysisHistory.length > 0
        ? analysisHistory.reduce(
            (sum, item) => sum + Number(item.fake_probability ?? 0),
            0
          ) / analysisHistory.length
        : 0,
    videoScores: analysisHistory
      .filter(
        (item) =>
          item.type === "Video" &&
          item.forensic_score !== null &&
          item.forensic_score !== undefined
      )
      .map((item) => Number(item.forensic_score)),
  };

  const averageForensicScore =
    analytics.videoScores.length > 0
      ? analytics.videoScores.reduce((sum, score) => sum + score, 0) /
        analytics.videoScores.length
      : 0;

  const realPercentage =
    analytics.total > 0 ? (analytics.real / analytics.total) * 100 : 0;

  const fakePercentage =
    analytics.total > 0 ? (analytics.fake / analytics.total) * 100 : 0;

  const imagePercentage =
    analytics.total > 0 ? (analytics.images / analytics.total) * 100 : 0;

  const videoPercentage =
    analytics.total > 0 ? (analytics.videos / analytics.total) * 100 : 0;

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
  // FORENSIC REPORT - DIRECT PDF DOWNLOAD
  // =========================

  const generateForensicReport = (type, fileName, analysisResult) => {
    if (!analysisResult) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 18;

    const fakeProbability = Number(analysisResult.fake_probability ?? 0);
    const realProbability = Number(analysisResult.real_probability ?? 0);
    const aiProbability = Number(
      analysisResult.ai_generated_probability ??
      analysisResult.fake_probability ??
      0
    );
    const probabilityLevel = getProbabilityLevel(fakeProbability);
    const reportDate = new Date().toLocaleString();
    const isVideo = type === "Video";

    const temporalConsistency = isVideo
      ? Number(analysisResult.temporal_consistency ?? 0) * 100
      : null;
    const forensicScore = isVideo
      ? Number(analysisResult.forensic_score ?? 0)
      : null;
    const suspiciousFrames = isVideo
      ? Number(analysisResult.suspicious_frames ?? 0)
      : null;
    const totalFrames = isVideo
      ? Number(analysisResult.frames_analyzed ?? 0)
      : null;
    const suspiciousPercentage = isVideo
      ? Number(analysisResult.suspicious_percentage ?? 0)
      : null;
    const duration = isVideo
      ? analysisResult.video_duration ?? "N/A"
      : null;
    const forensicAssessment = isVideo
      ? analysisResult.forensic_assessment ?? "N/A"
      : null;

    const addPageIfNeeded = (neededHeight = 12) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = 18;
      }
    };

    const addSectionTitle = (title) => {
      addPageIfNeeded(18);
      doc.setFillColor(49, 46, 129);
      doc.rect(margin, y, contentWidth, 0.8, "F");
      y += 7;
      doc.setTextColor(49, 46, 129);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(title, margin, y);
      y += 8;
      doc.setTextColor(30, 41, 59);
    };

    const addField = (label, value) => {
      const textValue = String(value ?? "N/A");
      const wrapped = doc.splitTextToSize(textValue, contentWidth - 6);
      const boxHeight = Math.max(15, 9 + wrapped.length * 5);

      addPageIfNeeded(boxHeight + 4);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentWidth, boxHeight, 2.5, 2.5, "FD");

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(label, margin + 5, y + 6);

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(wrapped, margin + 5, y + 12);

      y += boxHeight + 4;
    };

    const addParagraph = (text) => {
      const wrapped = doc.splitTextToSize(text, contentWidth);
      const height = wrapped.length * 5 + 3;
      addPageIfNeeded(height);
      doc.setTextColor(51, 65, 85);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(wrapped, margin, y);
      y += height;
    };

    // Header
    doc.setFillColor(49, 46, 129);
    doc.rect(0, 0, pageWidth, 34, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.text("DeepFakeShield", margin, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("AI-Powered Digital Authenticity Analysis", margin, 23);

    y = 45;

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Forensic Analysis Report", margin, y);
    y += 7;

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated: ${reportDate}`, margin, y);
    y += 12;

    // Main result box
    const prediction = String(analysisResult.prediction ?? "Unknown");
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 29, 3, 3, "FD");

    doc.setTextColor(49, 46, 129);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(prediction, pageWidth / 2, y + 11, { align: "center" });

    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `AI-generated probability: ${aiProbability.toFixed(2)}%`,
      pageWidth / 2,
      y + 18,
      { align: "center" }
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      `Probability level: ${probabilityLevel}`,
      pageWidth / 2,
      y + 24,
      { align: "center" }
    );

    y += 39;

    addSectionTitle("File Information");
    addField("File Name", fileName);
    addField("Analysis Type", type);
    addField("Analysis Date", reportDate);

    addSectionTitle("Probability Analysis");
    addField("Real Probability", `${realProbability.toFixed(2)}%`);
    addField("Fake Probability", `${fakeProbability.toFixed(2)}%`);
    addField("AI-generated Probability", `${aiProbability.toFixed(2)}%`);
    addField("Probability Level", probabilityLevel);

    if (isVideo) {
      addSectionTitle("Video Forensic Analysis");
      addField("Video Duration", `${duration}s`);
      addField("Frames Analyzed", totalFrames);
      addField("Suspicious Frames", suspiciousFrames);
      addField("Suspicious Portion", `${suspiciousPercentage.toFixed(2)}%`);
      addField("Temporal Consistency", `${temporalConsistency.toFixed(2)}%`);
      addField("Forensic Score", `${forensicScore.toFixed(2)}%`);
      addField("Forensic Assessment", forensicAssessment);

      if (
        Array.isArray(analysisResult.suspicious_segments) &&
        analysisResult.suspicious_segments.length > 0
      ) {
        addSectionTitle("Suspicious Segments");

        analysisResult.suspicious_segments.forEach((segment, index) => {
          addField(
            `Suspicious Segment ${index + 1}`,
            `${segment.start ?? "N/A"} → ${segment.end ?? "N/A"} | Duration: ${segment.duration ?? "N/A"}s`
          );
        });
      }

      if (
        Array.isArray(analysisResult.frame_analysis) &&
        analysisResult.frame_analysis.length > 0
      ) {
        addSectionTitle("Frame-by-Frame Analysis");

        analysisResult.frame_analysis.forEach((frame) => {
          addField(
            `Frame ${frame.frame_number ?? "N/A"}`,
            `Prediction: ${frame.prediction ?? "N/A"} | Timestamp: ${frame.timestamp ?? "N/A"} | Real: ${frame.real_probability ?? "N/A"}% | Fake: ${frame.fake_probability ?? "N/A"}% | Confidence: ${frame.confidence ?? "N/A"}%`
          );
        });
      }
    }

    addSectionTitle("Analysis Summary");
    addParagraph(
      `DeepFakeShield analyzed the submitted ${type.toLowerCase()} using its configured AI-based authenticity detection pipeline.`
    );
    addParagraph(
      `The detected prediction was ${prediction} with a fake probability of ${fakeProbability.toFixed(2)}%.`
    );

    if (isVideo) {
      addParagraph(
        `The video forensic analysis examined ${totalFrames} frames and identified ${suspiciousFrames} suspicious frames, representing ${suspiciousPercentage.toFixed(2)}% of the analyzed frames.`
      );
    }

    addParagraph(
      "This report presents automated analysis results and should be interpreted together with the underlying evidence and analysis context."
    );

    // Footer on every page
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "DeepFakeShield Forensic Analysis System",
        margin,
        pageHeight - 8
      );
      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: "right" }
      );
    }

    const safeFileName = String(fileName || "analysis")
      .replace(/[^a-z0-9._-]+/gi, "_")
      .replace(/^_+|_+$/g, "");

    doc.save(`DeepFakeShield_Forensic_Report_${safeFileName || "analysis"}.pdf`);
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
                className="analyze-button"
                onClick={() =>
                  generateForensicReport(
                    "Image",
                    selectedFile?.name || "Image",
                    result
                  )
                }
              >
                Download Forensic Report
              </button>

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
                className="analyze-button"
                onClick={() =>
                  generateForensicReport(
                    "Video",
                    selectedVideo?.name || "Video",
                    videoResult
                  )
                }
              >
                Download Forensic Report
              </button>

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
            ANALYTICS DASHBOARD
        ========================= */}

        {analysisHistory.length > 0 && (
          <section className="history-section" style={{ marginBottom: "30px" }}>
            <div className="section-heading">
              <div>
                <span>ANALYTICS DASHBOARD</span>
                <h2>Analysis Overview</h2>
              </div>
            </div>

            {/* Overview Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              {[
                ["Total Analyses", analytics.total, "📊"],
                ["Images", analytics.images, "🖼️"],
                ["Videos", analytics.videos, "🎥"],
                ["Real Results", analytics.real, "✅"],
                ["Fake Results", analytics.fake, "⚠️"],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "18px",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    {icon}
                  </div>
                  <span
                    style={{
                      display: "block",
                      color: "#64748b",
                      fontSize: "13px",
                      marginBottom: "5px",
                    }}
                  >
                    {label}
                  </span>
                  <strong
                    style={{
                      display: "block",
                      color: "#0f172a",
                      fontSize: "25px",
                    }}
                  >
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            {/* Probability and Forensic Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  Average Fake Probability
                </span>
                <strong
                  style={{
                    display: "block",
                    marginTop: "7px",
                    fontSize: "28px",
                    color: "#312e81",
                  }}
                >
                  {analytics.averageFakeProbability.toFixed(2)}%
                </strong>
                <div
                  style={{
                    height: "9px",
                    background: "#e2e8f0",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginTop: "12px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(
                        Math.max(analytics.averageFakeProbability, 0),
                        100
                      )}%`,
                      background: "#312e81",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <span style={{ color: "#64748b", fontSize: "13px" }}>
                  Average Video Forensic Score
                </span>
                <strong
                  style={{
                    display: "block",
                    marginTop: "7px",
                    fontSize: "28px",
                    color: "#312e81",
                  }}
                >
                  {analytics.videoScores.length > 0
                    ? `${averageForensicScore.toFixed(2)}%`
                    : "N/A"}
                </strong>
                <p
                  style={{
                    marginTop: "8px",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  Based on {analytics.videoScores.length} analyzed video
                  {analytics.videoScores.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Distribution Charts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginBottom: "18px" }}>Real vs Fake</h3>

                <div
                  style={{
                    height: "18px",
                    display: "flex",
                    borderRadius: "999px",
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  {analytics.real > 0 && (
                    <div
                      style={{
                        width: `${realPercentage}%`,
                        background: "#16a34a",
                      }}
                      title={`Real: ${analytics.real}`}
                    />
                  )}
                  {analytics.fake > 0 && (
                    <div
                      style={{
                        width: `${fakePercentage}%`,
                        background: "#dc2626",
                      }}
                      title={`Fake: ${analytics.fake}`}
                    />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginTop: "15px",
                    fontSize: "14px",
                  }}
                >
                  <span>
                    <strong style={{ color: "#16a34a" }}>●</strong> Real:{" "}
                    {analytics.real} ({realPercentage.toFixed(1)}%)
                  </span>
                  <span>
                    <strong style={{ color: "#dc2626" }}>●</strong> Fake:{" "}
                    {analytics.fake} ({fakePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <h3 style={{ marginBottom: "18px" }}>Analysis Type</h3>

                <div
                  style={{
                    height: "18px",
                    display: "flex",
                    borderRadius: "999px",
                    overflow: "hidden",
                    background: "#e2e8f0",
                  }}
                >
                  {analytics.images > 0 && (
                    <div
                      style={{
                        width: `${imagePercentage}%`,
                        background: "#4f46e5",
                      }}
                      title={`Images: ${analytics.images}`}
                    />
                  )}
                  {analytics.videos > 0 && (
                    <div
                      style={{
                        width: `${videoPercentage}%`,
                        background: "#7c3aed",
                      }}
                      title={`Videos: ${analytics.videos}`}
                    />
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginTop: "15px",
                    fontSize: "14px",
                  }}
                >
                  <span>
                    <strong style={{ color: "#4f46e5" }}>●</strong> Images:{" "}
                    {analytics.images} ({imagePercentage.toFixed(1)}%)
                  </span>
                  <span>
                    <strong style={{ color: "#7c3aed" }}>●</strong> Videos:{" "}
                    {analytics.videos} ({videoPercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "20px",
                marginTop: "14px",
              }}
            >
              <h3 style={{ marginBottom: "15px" }}>Recent Analysis Activity</h3>

              {analysisHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: 0,
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>
                      {item.type === "Image" ? "🖼️" : "🎥"}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.fileName}
                      </strong>
                      <small style={{ color: "#64748b" }}>
                        {item.timestamp}
                      </small>
                    </div>
                  </div>

                  <span
                    style={{
                      flexShrink: 0,
                      fontWeight: "700",
                      fontSize: "13px",
                      color:
                        item.prediction?.toLowerCase() === "fake"
                          ? "#dc2626"
                          : "#16a34a",
                    }}
                  >
                    {item.prediction || "Analyzed"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* =========================
            ANALYSIS HISTORY
        ========================= */}

        {analysisHistory.length > 0 && (
          <section className="history-section">
            <div className="section-heading">
              <div>
                <span>ANALYSIS HISTORY</span>
                <h2>Previous Analyses</h2>
              </div>

              <button
                className="clear-history-btn"
                onClick={() => {
                  localStorage.removeItem("deepfakeShieldHistory");
                  setAnalysisHistory([]);
                }}
              >
                Clear History
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <input
                type="text"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search by file name..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "#ffffff",
                }}
              />

              <select
                value={historyTypeFilter}
                onChange={(event) => setHistoryTypeFilter(event.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Types</option>
                <option value="Image">Images</option>
                <option value="Video">Videos</option>
              </select>

              <select
                value={historyPredictionFilter}
                onChange={(event) =>
                  setHistoryPredictionFilter(event.target.value)
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  background: "#ffffff",
                  cursor: "pointer",
                }}
              >
                <option value="All">All Results</option>
                <option value="Real">Real</option>
                <option value="Fake">Fake</option>
              </select>
            </div>

            <div className="history-list">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                <div className="history-card" key={item.id}>
                  <div className="history-icon">
                    {item.type === "Image" ? "🖼️" : "🎥"}
                  </div>

                  <div className="history-info">
                    <strong>{item.fileName}</strong>

                    <span>
                      {item.type === "Image"
                        ? "Image Analysis"
                        : "Video Analysis"}
                    </span>

                    <small>{item.timestamp}</small>
                  </div>

                  <div
                    className={`history-result ${
                      item.prediction?.toLowerCase() === "fake"
                        ? "history-fake"
                        : "history-real"
                    }`}
                  >
                    {item.prediction || "Analyzed"}
                  </div>

                  <button
                    className="reset-button"
                    style={{
                      marginTop: "0",
                      padding: "10px 16px",
                      fontSize: "14px",
                    }}
                    onClick={() => setSelectedHistoryItem(item)}
                  >
                    View Details
                  </button>
                </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 20px",
                    color: "#64748b",
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  No analyses match your search or filters.
                </div>
              )}
            </div>
          </section>
        )}

        {/* =========================
            HISTORY DETAILS
        ========================= */}

        {selectedHistoryItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
            onClick={() => setSelectedHistoryItem(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "650px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "28px",
                boxShadow: "0 20px 60px rgba(15, 23, 42, 0.25)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#64748b",
                      letterSpacing: "1px",
                    }}
                  >
                    ANALYSIS DETAILS
                  </span>
                  <h2 style={{ margin: "6px 0 0" }}>
                    {selectedHistoryItem.fileName}
                  </h2>
                </div>

                <button
                  className="clear-history-btn"
                  onClick={() => setSelectedHistoryItem(null)}
                >
                  Close
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                <div className="history-detail">
                  <span>Analysis Type</span>
                  <strong>{selectedHistoryItem.type}</strong>
                </div>

                <div className="history-detail">
                  <span>Prediction</span>
                  <strong>{selectedHistoryItem.prediction || "N/A"}</strong>
                </div>

                <div className="history-detail">
                  <span>Real Probability</span>
                  <strong>
                    {selectedHistoryItem.real_probability ?? "N/A"}%
                  </strong>
                </div>

                <div className="history-detail">
                  <span>Fake Probability</span>
                  <strong>
                    {selectedHistoryItem.fake_probability ?? "N/A"}%
                  </strong>
                </div>

                <div className="history-detail">
                  <span>AI-generated Probability</span>
                  <strong>
                    {selectedHistoryItem.fake_probability ?? "N/A"}%
                  </strong>
                </div>

                {selectedHistoryItem.type === "Video" && (
                  <div className="history-detail">
                    <span>Forensic Score</span>
                    <strong>
                      {selectedHistoryItem.forensic_score ?? "N/A"}
                    </strong>
                  </div>
                )}

                <div className="history-detail">
                  <span>Analyzed On</span>
                  <strong>{selectedHistoryItem.timestamp}</strong>
                </div>
              </div>

              <p
                className="disclaimer"
                style={{ marginTop: "22px", marginBottom: 0 }}
              >
                This information is the summary saved when this analysis was
                completed. Running a new analysis creates a new history entry.
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;