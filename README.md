# CareerTrainer - AI-Powered Career Development Platform

CareerTrainer is a comprehensive, AI-driven platform designed to help users navigate their career paths, build professional resumes, practice interviews, and track their daily learning progress.

## 🚀 Key Features

### 1. **AI Resume Builder**
- **Dynamic Content Generation:** Parses user input and uses AI to enhance resume sections with industry-standard keywords.
- **Classic & Modern Templates:** Choose between different professional styles.
- **Export to PDF:** Generate and download high-quality PDF resumes instantly.
- **Activity Tracking:** Tracks resume creation frequency to visualize productivity on the dashboard.

### 2. **AI Interview Trainer**
- **Personalized Sessions:** Configures interview questions based on target job titles and company names.
- **Real-time Feedback:** Analyzes user answers for grammar, filler words, and clarity.
- **Performance Analytics:** Provides an overall readiness score and highlights strengths and weaknesses.

### 3. **Interactive Skill Roadmaps**
- **4-Week Structured Learning:** Generates a personalized 4-week roadmap for over 40+ career roles (e.g., Data Analyst, Web Developer, Software Engineer).
- **6 Essential Tasks Per Week:** Each week is broken down into 6 focused modules to ensure steady progress.
- **Curated Resources:** Links to high-quality websites and YouTube videos for each topic.

### 4. **User Dashboard & Analytics**
- **Overall Readiness Gauge:** Visualizes total path completion across the entire curriculum.
- **Weekly Progress Pie Charts:** Individual progress tracking for each of the 4 weeks.
- **Resume Activity Graph:** A line/area graph showing resume creation trends over time.
- **Profile Management:** Update display name and photo URL directly from the dashboard.

### 5. **Multi-User & Cross-Device Support**
- **Firebase Authentication:** Secure login using Google or Email/Password.
- **Persistent Cloud Storage:** Uses **MongoDB Atlas** for storing user activity, progress, and settings, ensuring data is available on any device.
- **Daily Progress Logic:** Enforces a "one task per day" rule to maintain a consistent and high-quality learning pace.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React.
- **Backend:** Node.js, Express.
- **Database:** MongoDB Atlas (Mongoose).
- **Authentication:** Firebase Auth.
- **AI/ML:** Transformers.js (for browser-side inference).

## 🏃 Getting Started

### Prerequisites
- Node.js installed.
- MongoDB Atlas account.
- Firebase project configured.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shammatthews-life/carrer_developer.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root and server directories with your Firebase and MongoDB credentials.

4. **Run the application:**
   - **Frontend:** `npm run dev`
   - **Backend:** `node server/index.js`

## 📄 License
This project is licensed under the MIT License.
