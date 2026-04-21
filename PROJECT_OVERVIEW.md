# Project Overview: CampusPath (AI-Driven Learning Platform)

**CampusPath** is a state-of-the-art educational platform that leverages Artificial Intelligence to create personalized, adaptive learning roadmaps for students. It analyzes a user's existing technical background (via GitHub) and constructs a detailed "Zero to Hero" path toward their chosen career goal.

---

## 🚀 Core Functionality

1.  **AI Roadmap Generation**:
    *   Uses **Google Gemini AI** to generate a comprehensive 8-12 week learning path.
    *   The path is adaptive: it identifies what the user already knows (from GitHub activity) and builds upon it without unnecessary repetition.
2.  **GitHub Integration**:
    *   Analyzes user repositories to identify languages, frameworks, and proficiency levels.
    *   Features a **Repository Verification System** where users must build and push specific projects to GitHub to "pass" their weekly milestones.
3.  **Interactive 3D Visuals & UI**:
    *   Uses **Spline** and **Three.js** to create a futurist, premium user experience.
    *   Animated UI components using **Framer Motion**.
4.  **Real-time Communication**:
    *   **Socket.io** integration for live updates and potential community features.
5.  **Progress Tracking**:
    *   Users can mark daily tasks as complete and track their overall completion percentage toward their goal.

---

## 🛠 Technology Stack

### Frontend (User Interface)
*   **React 19 (Vite)**: Modern, high-performance web framework.
*   **Tailwind CSS 4**: For sleek, custom styling and dark-mode aesthetics.
*   **Framer Motion**: For fluid animations and micro-interactions.
*   **Spline/Three.js**: To deliver high-fidelity 3D interactive designs.
*   **Axios**: For making secure API requests to the backend.
*   **Recharts**: For displaying user progress data visually.

### Backend (Server Side)
*   **Node.js & Express**: Scalable server architecture.
*   **MongoDB & Mongoose**: NoSQL database for flexible storage of roadmaps and user data.
*   **Socket.io**: Real-time event-based communication.
*   **JWT (JSON Web Token)**: Secure authentication and session management.

### AI & Integrations
*   **Google Generative AI (Gemini)**: The "brain" of the platform, responsible for roadmap architecture.
*   **GitHub API (with GraphQL)**: For deep analysis of user contributions and repository verification.

---

## 📁 Project Structure

### Backend (`/backend`)
*   `src/controllers/`: Contains the logic for Roadmap generation, Authentication, and GitHub analysis.
*   `src/services/`: Specific services for **Gemini AI**, **GitHub API**, and **Auth**.
*   `src/models/`: Database schemas for Users, Roadmaps, and Progress.
*   `src/server.js`: Entry point that initializes Express and Socket.io.

### Frontend (`/frontend`)
*   `src/pages/`: Main views like `Home`, `Dashboard`, `RoadmapViewer`, and `Onboarding`.
*   `src/components/`: Reusable UI elements (Buttons, Cards, 3D Canvas views).
*   `src/hooks/`: Custom React hooks for global state and API handling.

---

## 📦 Key Dependencies

| Dependency | Purpose |
| :--- | :--- |
| `@google/generative-ai` | Integrates Google Gemini for roadmap AI generation. |
| `framer-motion` | Handles premium animations and UI transitions. |
| `socket.io` | Enables real-time server-client communication. |
| `mongoose` | Connects the application to the MongoDB database. |
| `pdf-parse` | (Backend) Used for future feature of analyzing resumes/PDFs. |
| `bcryptjs` | Ensures user passwords are encrypted for security. |

---

## 🤝 Team Workflow

1.  **Backend Development**: Focus on refining the AI prompts and GitHub verification logic.
2.  **Frontend Development**: Enhance the 3D interaction and ensure the Roadmap UI is intuitive.
3.  **Testing**: Verify that the AI correctly interprets the "Known Skills" and skips them if requested (or reviews them if the "Full Journey" is selected).

---
*Created for the CampusPath Development Team.*
