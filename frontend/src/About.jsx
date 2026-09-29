import React from "react";

function About({ onHome, onLogin, onRegister }) {
  return (
    <div className="public-page">
      <header className="public-header">
        <div className="public-logo">
          <div className="public-logo-icon">DS</div>
          <span>DeepFakeShield</span>
        </div>

        <nav className="public-nav">
          <button type="button" onClick={onHome}>
            Home
          </button>

          <button type="button" className="public-nav-active">
            About
          </button>

          <button type="button" onClick={onLogin}>
            Login
          </button>

          <button
            type="button"
            className="public-register-btn"
            onClick={onRegister}
          >
            Register
          </button>
        </nav>
      </header>

      <main className="about-page-main">
        <section className="about-hero">
          <div className="hero-badge">
            ABOUT DEEPFAKESHIELD
          </div>

          <h1>
            Understanding Digital
            <br />
            <span>Authenticity</span>
          </h1>

          <p>
            DeepFakeShield is an AI-powered digital authenticity analysis
            system designed to help users examine images and videos for signs
            of manipulation or AI-generated content.
          </p>
        </section>

        <section className="about-content">
          <div className="about-card">
            <div className="feature-icon">🤖</div>
            <h2>AI-Powered Detection</h2>
            <p>
              DeepFakeShield analyzes submitted media using its configured
              artificial intelligence detection pipeline and provides
              probability-based authenticity results.
            </p>
          </div>

          <div className="about-card">
            <div className="feature-icon">🎥</div>
            <h2>Video Forensics</h2>
            <p>
              Video analysis examines selected frames and provides information
              such as suspicious frames, timestamps, suspicious segments and
              forensic analysis metrics.
            </p>
          </div>

          <div className="about-card">
            <div className="feature-icon">📈</div>
            <h2>Analysis Insights</h2>
            <p>
              Users can review analysis history and analytics to understand
              previous image and video analysis results.
            </p>
          </div>

          <div className="about-card">
            <div className="feature-icon">📄</div>
            <h2>Forensic Reports</h2>
            <p>
              DeepFakeShield provides downloadable forensic reports containing
              the available analysis information and results.
            </p>
          </div>
        </section>

        <section className="about-workflow">
          <div className="public-section-heading">
            <span>HOW IT WORKS</span>
            <h2>Simple Analysis Workflow</h2>
          </div>

          <div className="workflow-grid">
            <div className="workflow-step">
              <div>01</div>
              <h3>Upload</h3>
              <p>Select an image or video for analysis.</p>
            </div>

            <div className="workflow-step">
              <div>02</div>
              <h3>Analyze</h3>
              <p>The system processes the submitted media.</p>
            </div>

            <div className="workflow-step">
              <div>03</div>
              <h3>Review</h3>
              <p>Review probabilities and available forensic information.</p>
            </div>

            <div className="workflow-step">
              <div>04</div>
              <h3>Report</h3>
              <p>Save analysis information through the available report tools.</p>
            </div>
          </div>
        </section>

        <section className="public-cta">
          <div>
            <span>START ANALYZING</span>
            <h2>Explore DeepFakeShield.</h2>
          </div>

          <button type="button" onClick={onRegister}>
            Get Started
          </button>
        </section>
      </main>

      <footer className="public-footer">
        <strong>DeepFakeShield</strong>
        <span>AI-powered digital authenticity analysis</span>
      </footer>
    </div>
  );
}

export default About;