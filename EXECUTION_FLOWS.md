# Execution Flows: A Step-by-Step Guide for Developers

This document explains exactly how data moves through the CampusPath system for the two most critical user actions.

---

## 🏗 Flow 1: Generate AI Roadmap

When a user clicks "Generate Roadmap", the following process occurs:

1.  **Frontend State**: 
    - `RoadmapViewer.jsx` sets `generating` state to `true`.
    - It gathers `githubUsername` and `targetRole` from the logged-in user's context.
2.  **API Call**: 
    - A POST request is sent to `/api/roadmap/generate`.
3.  **Backend Controller (`roadmapController.js`)**:
    - Calls `analyzeGitHub(username)` to get the latest skill profile.
    - Calls `generateRoadmap({ role, githubAnalysis, ... })` to talk to Gemini.
4.  **AI Service (`geminiService.js`)**:
    - Injects user's "Known Skills" into a large system prompt.
    - Sends the request to **Gemini 1.5 Flash**.
    - If it fails (429/503), it retries automatically up to 5 times with sleep buffers.
    - Once success, it parses the JSON response and returns a standard Roadmap object.
5.  **Database Persistence**:
    - The controller saves the new roadmap to the `Roadmaps` collection.
    - It also initializes a `Progress` document for that specific roadmap.
6.  **Frontend Completion**:
    - The API responds with the new roadmap.
    - `RoadmapViewer` refreshes its local state and renders the winding ZigZag path.

---

## ✅ Flow 2: Repository Verification (Milestone)

When a user clicks "Verify Repository" for a specific week:

1.  **Frontend State**:
    - `RoadmapViewer` sets `verifying` state to `true`.
2.  **API Call**:
    - A POST request is sent to `/api/roadmap/:id/verify-milestone` with the `weekNumber`.
3.  **Backend Logic (`roadmapController.js`)**:
    - It finds the roadmap in the database.
    - It identifies the `expectedRepoName` for that specific week (e.g., `cp-react-week2-todo-list`).
4.  **GitHub Check (`githubService.js`)**:
    - Uses `axios` to hit `https://api.github.com/repos/{username}/{expectedRepoName}`.
    - Checks the response status code.
5.  **Status Update**:
    - **If 200 (Success)**: 
        - Sets `isRepoVerified = true` for that week.
        - Automatically marks all 7 days of that week as `completed`.
        - Recalculates the total `completionPercentage` for the entire roadmap.
    - **If 404 (Fail)**:
        - Returns a message telling the user exactly what repo name to use.
6.  **Response**:
    - Sends the updated roadmap object back to the UI.
    - Frontend animations play a "Success" or "Error" toast.

---

## 🔐 Flow 3: Unified User Sync

When a user updates their profile (e.g., changing their Target Role):

1.  **Backend Update**: 
    - `authController.js` updates the `User` document.
2.  **Cascade Logic**:
    - The system identifies all existing roadmaps for that user.
    - It updates headers or settings across those roadmaps to ensure consistency.
3.  **AI Refresh**: 
    - The UI prompts the user if they want to "Generate a New Roadmap" to match their new role.

---
*Created for the CampusPath Execution Team.*
