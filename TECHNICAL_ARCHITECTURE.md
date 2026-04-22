# Technical Architecture & Developer Guide: CampusPath

This document provides a deep-dive into the internal logic, data flow, and architecture of the CampusPath platform. It is designed for developers and team members to understand exactly how the system works "under the hood."

---

## 🏗 High-Level Architecture

CampusPath follows a decoupled **MERN** (MongoDB, Express, React, Node) architecture with heavy integrations:

1.  **Frontend (React/Vite)**: Handles 3D rendering (Spline), State (Hooks), and Animations (Framer Motion).
2.  **Backend (Express/Node)**: Orchestrates API requests, manages state, and talks to external services.
3.  **AI Engine (Gemini 1.5 Flash)**: Generates the core roadmap content via dynamic prompt engineering.
4.  **Data Layer (GitHub API & MongoDB)**: Analyzes user history and persists platform-specific data.

---

## 🧩 Module Deep-Dives

### 1. GitHub Analysis Engine (`githubService.js`)
This is the "Sense" module of the project. It builds a profile of the user based on their GitHub history.

*   **REST API Analysis**: Fetches general repo data, languages, and descriptions. It uses a **Keyword-to-Framework mapping** (e.g., searching for "react" in repo names to identify React skills).
*   **GraphQL Integration**: Uses GitHub's GraphQL API to fetch a precision **Contribution Heatmap** (contribution days, counts, and colors) for visualization.
*   **Health Scoring Logic**:
    *   **Consistency**: Calculated based on commit frequency over the last 12 months.
    *   **Diversity**: Based on the number of different languages and frameworks identified.
    *   **Quality**: High-level metric based on stars and repository engagement.
*   **Skill Level Determination**: Uses threshold logic (e.g., >20 repos or >50 stars = "Advanced") to influence the AI prompt.

### 2. Adaptive AI Planner (`geminiService.js`)
This is the "Brain" module. It translates GitHub analysis and user goals into a structured learning path.

*   **Prompt Engineering**: We use a **System Persona** (Elite Technical Mentor). The prompt is dynamically built using:
    *   `${targetRole}`: The goal.
    *   `${knownSkills}`: To avoid repetition.
    *   `${proficiency}`: To set the starting difficulty.
*   **Content Logic**: Every roadmap is strictly mandated to be 8-12 weeks and follow a "Zero to Hero" pedagogy.
*   **Resiliency (Retry Logic)**: 
    *   Implements **Exponential Backoff**.
    *   Detects `429` (Rate Limit) and `503` (High Demand) errors.
    *   Parses the `retryDelay` directly from the Google API error response to wait the exact required time before retrying (up to 5 attempts).

### 3. Milestone Verification Logic
Every week culminates in a practical project. The system verifies this projects existence:
1.  **Selection**: The AI assigns a unique `expectedRepoName` (e.g., `cp-react-week4-dashboard`).
2.  **Trigger**: When the user clicks "Verify Repository," the frontend calls the backend.
3.  **Check**: The backend hits the GitHub `/repos/{user}/{repo}` endpoint. If it returns `200 OK`, the milestone is marked as complete in the database.

---

## 📊 Data Model (Database Schema)

### User Model (`models/User.js`)
*   `name`, `email`, `password`: Core auth info.
*   `githubUsername`: Linked account for analysis.
*   `githubData`: Cached analysis result (languages, scores, etc.).
*   `targetRole`: The current career goal.
*   `onboardingComplete`: Flag to skip the intro flow.

### Roadmap Model (`models/Roadmap.js`)
*   `userId`: Link to the owner.
*   `weeks`: An array of Week objects.
    *   `days`: 7-day learning schedule.
    *   `tasks`: Checkable sub-tasks.
    *   `expectedRepoName`: The target for verification.
    *   `isRepoVerified`: Boolean status for the week.
*   `completionPercentage`: Real-time calculation based on tasks and milestones.

---

## 🔄 Interaction Flow (The Lifecycle)

1.  **Auth**: User registers/logs in via `authController`.
2.  **Onboarding**: User enters their `githubUsername` and `targetRole`.
3.  **Analysis**: `githubService` runs in the background to build the skill profile.
4.  **Generation**: `geminiService` receives the profile and goal, then generates a JSON roadmap.
5.  **Persistence**: The roadmap is saved to MongoDB, and a `Progress` document is initialized.
6.  **Learning**: User follows daily links (YouTube/Google Docs search strings).
7.  **Verification**: User pushes code to GitHub. Backend verifies repo existence. Progress updates automatically.

---

## 🛠 Developer Commands & Tips

*   **API Base**: `http://localhost:5000/api`
*   **Environment**: Always ensure `GEMINI_API_KEY`, `GITHUB_TOKEN`, and `MONGODB_URI` are set in `backend/.env`.
*   **Frontend Dev**: Component logic lives in `frontend/src/pages/RoadmapViewer.jsx` for the main study view.

---
*Document Version: 1.1 - Detailed Technical Architecture*
