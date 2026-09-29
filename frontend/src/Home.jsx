import React from "react";

function Home({ onLogin, onRegister, onAbout }) {
  return (
    <div className="public-page home-page">
      {/* =========================
          HEADER
      ========================= */}
      <header className="public-header">
        <div className="public-logo">
          <div className="public-logo-mark">DS</div>

          <div className="public-logo-text">
            <strong>DeepFakeShield</strong>
            <span>Digital Authenticity Protection</span>
          </div>
        </div>

        <nav className="public-nav">
          <button
            type="button"
            className="public-nav-link active"
          >
            Home
          </button>

          <button
            type="button"
            className="public-nav-link"
            onClick={onAbout}
          >
            About
          </button>

          <button
            type="button"
            className="public-nav-link"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            type="button"
            className="public-register-button"
            onClick={onRegister}
          >
            Register
          </button>
        </nav>
      </header>

      {/* =========================
          HERO SECTION
      ========================= */}
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              AI-Powered Digital Authenticity
            </div>

            <h1>
              Detect Deepfakes.
              <br />
              <span>Protect Digital Trust.</span>
            </h1>

            <p>
              DeepFakeShield uses AI-powered analysis to examine images and
              videos for signs of manipulation and AI-generated content.
            </p>

            <div className="hero-buttons">
              <button
                type="button"
                className="hero-primary-button"
                onClick={onLogin}
              >
                Analyze Now
                <span>→</span>
              </button>

              <button
                type="button"
                className="hero-secondary-button"
                onClick={onAbout}
              >
                Learn More
              </button>
            </div>

            <div className="hero-trust">
              <div className="trust-item">
                <strong>Image</strong>
                <span>Detection</span>
              </div>

              <div className="trust-divider"></div>

              <div className="trust-item">
                <strong>Video</strong>
                <span>Forensics</span>
              </div>

              <div className="trust-divider"></div>

              <div className="trust-item">
                <strong>AI</strong>
                <span>Analysis</span>
              </div>
            </div>
          </div>

          {/* =========================
              HERO VISUAL
          ========================= */}
          <div className="hero-visual">
            <div className="hero-glow"></div>

            <div className="shield-card">
              <div className="shield-top">
                <span className="shield-status">
                  <span className="status-dot"></span>
                  SYSTEM ACTIVE
                </span>

                <span className="shield-code">
                  DF-SHIELD
                </span>
              </div>

              <div className="shield-icon-wrapper">
                <div className="shield-icon">
                  <div className="shield-icon-inner">
                    DS
                  </div>
                </div>
              </div>

              <div className="shield-title">
                <h2>Authenticity</h2>
                <p>Analysis Engine</p>
              </div>

              <div className="scan-line"></div>

              <div className="shield-metrics">
                <div className="shield-metric">
                  <span>IMAGE</span>
                  <strong>READY</strong>
                </div>

                <div className="shield-metric">
                  <span>VIDEO</span>
                  <strong>READY</strong>
                </div>

                <div className="shield-metric">
                  <span>FORENSICS</span>
                  <strong>ACTIVE</strong>
                </div>
              </div>
            </div>

            <div className="floating-card floating-card-one">
              <span className="floating-icon">◈</span>
              <div>
                <strong>AI Detection</strong>
                <small>Real-time analysis</small>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <span className="floating-icon">✓</span>
              <div>
                <strong>Secure Analysis</strong>
                <small>Detailed results</small>
              </div>
            </div>
          </div>
        </section>

        {/* =========================
            FEATURES
        ========================= */}
        <section className="features-section">
          <div className="section-heading">
            <span>CORE CAPABILITIES</span>

            <h2>
              Powerful analysis for
              <br />
              modern digital media
            </h2>

            <p>
              DeepFakeShield combines image detection, video analysis and
              forensic insights in one platform.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-number">01</div>

              <div className="feature-icon">
                ◉
              </div>

              <h3>Image Detection</h3>

              <p>
                Analyze uploaded images and receive AI-based authenticity
                probabilities with clear results.
              </p>

              <span className="feature-link">
                Image Analysis →
              </span>
            </div>

            <div className="feature-card">
              <div className="feature-number">02</div>

              <div className="feature-icon">
                ▶
              </div>

              <h3>Video Detection</h3>

              <p>
                Examine selected video frames to identify suspicious content
                and potential manipulation.
              </p>

              <span className="feature-link">
                Video Analysis →
              </span>
            </div>

            <div className="feature-card">
              <div className="feature-number">03</div>

              <div className="feature-icon">
                ⌁
              </div>

              <h3>Forensic Analysis</h3>

              <p>
                Review frame-level evidence, suspicious segments, temporal
                consistency and forensic scoring.
              </p>

              <span className="feature-link">
                Forensic Insights →
              </span>
            </div>

            <div className="feature-card">
              <div className="feature-number">04</div>

              <div className="feature-icon">
                ▣
              </div>

              <h3>Analytics & History</h3>

              <p>
                Keep track of previous analyses and review summarized
                authenticity insights.
              </p>

              <span className="feature-link">
                View Insights →
              </span>
            </div>
          </div>
        </section>

        {/* =========================
            CTA
        ========================= */}
        <section className="public-cta">
          <div className="cta-content">
            <span className="cta-label">
              START ANALYZING
            </span>

            <h2>
              Take control of your
              <br />
              digital authenticity.
            </h2>

            <p>
              Upload an image or video and explore the analysis capabilities
              of DeepFakeShield.
            </p>

            <button
              type="button"
              className="cta-button"
              onClick={onRegister}
            >
              Create an Account
              <span>→</span>
            </button>
          </div>

          <div className="cta-pattern">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </section>
      </main>

      {/* =========================
          FOOTER
      ========================= */}
      <footer className="public-footer">
        <div>
          <strong>DeepFakeShield</strong>
          <span>
            AI-powered digital authenticity analysis
          </span>
        </div>

        <p>
          © {new Date().getFullYear()} DeepFakeShield. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default Home;