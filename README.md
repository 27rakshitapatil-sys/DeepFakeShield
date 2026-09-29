# 🛡️ DeepFakeShield

DeepFakeShield is an AI-powered deepfake detection system designed to analyze **images and videos** and identify potentially manipulated or AI-generated content.

The system combines deep learning, computer vision, face tracking, temporal analysis, and forensic analysis to provide detailed detection results.

---

## 🚀 Features

### 🖼️ Image Deepfake Detection

- Upload an image for analysis
- Detects whether the image is Real or Fake
- Displays:
  - Real Probability
  - Fake Probability
  - AI-generated Probability
  - Risk Level
- Image preview before analysis
- Analyze another image option

### 🎥 Video Deepfake Detection

- Upload and analyze videos
- Extracts selected frames from the video
- Performs frame-by-frame deepfake detection
- Displays:
  - Real/Fake prediction
  - Real Probability
  - Fake Probability
  - AI-generated Probability
  - Video duration
  - Frames analyzed
  - Suspicious frames
  - Suspicious percentage
  - Suspicious segments
  - Frame timestamps

### 🔍 Video Forensic Analysis

DeepFakeShield performs additional temporal analysis on videos.

Features include:

- Temporal consistency analysis
- Forensic score
- Forensic assessment
- Suspicious frame detection
- Suspicious segment identification
- Visual suspicious timeline
- Frame-by-frame forensic results

### 👤 Face Tracking

The system uses face tracking to support temporal analysis across video frames.

This helps analyze consistency in facial regions across multiple frames.

### 📊 Analysis History

Users can view previous analyses including:

- File name
- Analysis type
- Prediction
- Real probability
- Fake probability
- Video forensic score
- Timestamp

History is maintained separately for each authenticated user.

### 📈 Analytics Dashboard

The analytics section provides an overview of previous analyses.

It includes:

- Total analyses
- Image analyses
- Video analyses
- Real predictions
- Fake predictions
- Average fake probability
- Average video forensic score

### 🔐 Authentication

DeepFakeShield includes user authentication with:

- User registration
- Login
- Logout
- Authentication status
- User-specific analysis history

### 📄 Forensic Reports

Users can generate downloadable forensic analysis reports for analyzed content.

Reports contain relevant detection and forensic information.

---

## 🏗️ System Architecture

```text
                    DeepFakeShield
                          │
             ┌────────────┴────────────┐
             │                         │
        React Frontend             Django Backend
             │                         │
             │                ┌────────┴────────┐
             │                │                 │
             │          Image Analysis     Video Analysis
             │                │                 │
             │                └────────┬────────┘
             │                         │
             │                  AI/ML Detector
             │                         │
             │              ┌──────────┴──────────┐
             │              │                     │
             │         Deepfake Model        Face Tracking
             │              │                     │
             │              └──────────┬──────────┘
             │                         │
             └─────────────── Results ─┘

🛠️ Technologies Used
Frontend
React
Vite
JavaScript
CSS
Axios
jsPDF
Backend
Python
Django
Django REST Framework
Django CORS Headers
Gunicorn
AI / Machine Learning
PyTorch
Torchvision
Transformers
Hugging Face Hub
MediaPipe
OpenCV
NumPy
Computer Vision
OpenCV
MediaPipe Face Detection
Face Tracking
Frame Analysis
Temporal Consistency Analysis
Development Tools
Git
GitHub
VS Code
PowerShell
📁 Project Structure
DeepFakeShield/
│
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── ...
│
├── detector/
│   ├── ai_models/
│   │   └── deepfake_model.py
│   │
│   ├── face_tracking.py
│   ├── views.py
│   ├── urls.py
│   ├── auth_views.py
│   ├── models.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── Auth.jsx
│   │   ├── Home.jsx
│   │   └── About.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── models/
│   └── blaze_face_short_range.tflite
│
├── manage.py
├── requirements.txt
├── .gitignore
└── README.md
⚙️ Installation
1. Clone the Repository
git clone https://github.com/27rakshitapatil-sys/DeepFakeShield.git

Navigate into the project:

cd DeepFakeShield
🐍 Backend Setup

Create a Python virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install the required Python packages:

pip install -r requirements.txt
🗄️ Database Setup

Run Django migrations:

python manage.py migrate
▶️ Start the Django Backend
python manage.py runserver

The backend will normally be available at:

http://127.0.0.1:8000/
⚛️ Frontend Setup

Open another terminal and navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the Vite development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173/
🔄 Application Workflow
Image Analysis
Upload Image
     ↓
Image Preview
     ↓
Django API
     ↓
AI Deepfake Model
     ↓
Prediction
     ↓
Real / Fake
     ↓
Probability & Risk Analysis
Video Analysis
Upload Video
     ↓
Video Preview
     ↓
Frame Extraction
     ↓
Frame-by-Frame AI Detection
     ↓
Face Tracking
     ↓
Temporal Analysis
     ↓
Forensic Analysis
     ↓
Suspicious Timeline
     ↓
Final Video Result
🧠 AI Detection

DeepFakeShield uses an AI-based image detection model through the Hugging Face ecosystem.

The detector analyzes uploaded content and produces probability-based predictions that are presented through the application interface.

For videos, multiple frames are analyzed rather than relying on a single frame.

📊 Example Analysis Output
Image
Prediction: Fake

Real Probability: 0.14%
Fake Probability: 99.86%
AI-generated Probability: 99.86%

Risk Level: High
Video
Prediction: Real

Real Probability: 100%
Fake Probability: 0%

Frames Analyzed: 10
Suspicious Frames: 0
Suspicious Portion: 0%

Temporal Consistency: 53.91%

Example values are for demonstration and may vary depending on the input.

🔐 User Authentication

The application provides authentication APIs for:

Register
   ↓
Login
   ↓
Authenticated Dashboard
   ↓
Analysis
   ↓
User-specific History

Each user's analysis history is maintained separately.

📄 Reports

DeepFakeShield supports generating downloadable forensic reports containing analysis information such as:

Prediction
Probability values
Video statistics
Suspicious frames
Suspicious segments
Temporal consistency
Forensic score
Assessment
🎯 Project Objectives

The main objectives of DeepFakeShield are:

Detect potentially manipulated images and videos.
Provide probability-based deepfake analysis.
Analyze videos frame by frame.
Identify suspicious portions of videos.
Analyze temporal consistency.
Track faces across video frames.
Provide forensic analysis information.
Maintain user-specific analysis history.
Provide analytics for previous analyses.
Generate downloadable forensic reports.
🔮 Future Enhancements

Potential future improvements include:

Improved deepfake detection models
Larger and more diverse training datasets
Audio deepfake detection
Multimodal deepfake detection
Improved real-time video analysis
Cloud-based scalable inference
Advanced forensic visualization
Improved model explainability
⚠️ Disclaimer

DeepFakeShield is an academic/software engineering project for detecting potentially manipulated or AI-generated media.

AI-based detection systems can produce incorrect predictions. Results should therefore be treated as an analysis signal rather than definitive proof that media is authentic or manipulated.

👩‍💻 Developer

Rakshita Patil

B.Tech Computer Science and Engineering
Sharnbasva University

Skills Used
Python
Django
React
JavaScript
PyTorch
Transformers
OpenCV
MediaPipe
Machine Learning
REST APIs
Git & GitHub
📌 Project Status

DeepFakeShield — Active Project

The application is currently developed and tested locally with image detection, video detection, face tracking, forensic analysis, authentication, history, analytics, and report generation.

📜 License

This project is intended for educational and portfolio purposes.


### One important thing

I intentionally **didn't put a "Live Demo" link** in this README because the current Render deployment is returning 502/Internal Server Error and the Vercel deployment exceeded its function-size limit.

Your GitHub repository can still show the project professionally with the **Project Status** section above.
