# Codebase Deep Dive: CampusPath Developer Guide

This document provides a line-by-line conceptual walkthrough of the most critical parts of the CampusPath codebase. It is designed to help new team members understand "why" certain code was written and how it handles complex AI and API logic.

---

## 🖥 Frontend: The User Experience

### 1. `RoadmapViewer.jsx` (Core Study Interface)
This is the heart of the frontend. It handles the visualization and tracking of the learning path.

*   **ZigZag Visualization (`ZigZagRoadmap` component)**:
    *   **Logic**: Uses an SVG `<path>` with Quadratic Bezier curves (`Q`) to draw a winding path between weeks.
    *   **Status Management**: Weeks are dynamically styled as `done`, `active`, or `upcoming` based on the task completion percentage.
*   **Verification Workflow (`handleVerifyRepo` function)**:
    *   Triggers an API call to the backend.
    *   On success, it locally updates the `isRepoVerified` state to provide instant feedback without a full page reload.
*   **AI Search Links**:
    *   The "Watch Tutorial" and "Read Docs" buttons are not static. They use dynamically generated YouTube and Google search strings based on the daily topic to ensure the most relevant results are always just a click away.

### 2. `ThreeSkillTree.jsx` (The 3D Experience)
*   Integrates **Spline Runtime** to render a 3D interactive scene.
*   Communicates with the React side to potentially update 3D elements based on roadmap progress (DNA/Tree metaphor).

---

## ⚙️ Backend: The Logic Engine

### 1. `geminiService.js` (The AI Brain)
*   **Prompt Architecture**: The prompt is designed as a "System Instructor." It specifies the exact JSON schema the AI must return.
*   **Adaptive Logic**: The `${knownSkills}` variable is injected into the prompt. The AI is instructed to treat these as "Review" topics rather than new learning, ensuring the roadmap is tailored specifically to what is missing in the user's profile.
*   **Error Recovery**: The service catches JSON parsing errors. If the AI happens to return invalid JSON (e.g., with extra text), our matching logic `text.match(/\{[\s\S]*\}/)` strips everything except the actual JSON object.

### 2. `githubService.js` (The Analysis Engine)
*   **GraphQL Querying**: We use the `contributionsCollection` query to get 1 year of daily data. This is more efficient than hitting REST endpoints for every single day of the year.
*   **Health Score Math**:
    ```javascript
    const overallScore = Math.min(100, Math.round(
      (Math.min(repoCount, 20) * 2) + 
      (Math.min(totalStars, 100) * 0.5) + 
      (Math.min(totalCommits / 10, 30)) +
      (frameworks.size * 5)
    ));
    ```
    This weighted formula balances quantity (repoCount), quality (stars), activity (commits), and skills (frameworks).

### 3. `authController.js` (Profile & Sync)
*   **Automatic Syncing**: When a user updates their `githubUsername` in their profile, the controller automatically triggers a database update across all their existing roadmaps. This keeps the verification system in sync even if the user changes accounts.

---

## 🔄 The "Milestone Loop" (Crucial for Team Work)

This is the most complex logic in the project:
1.  **AI side**: Predicts an `expectedRepoName`.
2.  **User side**: Creates that repo on GitHub and pushes code.
3.  **App side**: Backend uses `axios` to check the GitHub Repository API.
4.  **Database side**: If the repo exists, `Roadmap.isRepoVerified` is set to `true`, and all 7 days of that week are automatically marked as `completed`. This provides a "Level Up" feeling similar to a game.

---

## 🛠 Pro-Tips for Developers

*   **Prompt Changes**: If you want to change how the AI talks, only edit the `prompt` variable in `geminiService.js`.
*   **Styling**: We use **Vite** with **Tailwind 4**, so all styles are utility-first. Avoid writing custom CSS in `.css` files unless absolutely necessary for 3D canvas containers.
*   **API Testing**: Use `test_ai.js` in the backend folder to debug AI responses without having to run the whole frontend.

---
*Created for the CampusPath Technical Team.*
