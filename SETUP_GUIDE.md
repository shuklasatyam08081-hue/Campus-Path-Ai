# Setup & Development Guide: CampusPath

This guide explains how to set up the project locally and begin contributing to the development of CampusPath.

---

## 📋 Prerequisites

*   **Node.js**: Version 18 or above.
*   **MongoDB**: Local instance running or a MongoDB Atlas URI.
*   **GitHub PAT**: A Personal Access Token (Classic) with `read:user` and `repo` scopes.
*   **Gemini API Key**: From Google AI Studio.

---

## 🛠 Installation Steps

### 1. Backend Setup
1.  Navigate to the `/backend` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add the following:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/campuspath
    JWT_SECRET=your_jwt_secret_here
    GEMINI_API_KEY=your_google_ai_studio_key
    GITHUB_TOKEN=your_github_token_here
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Frontend Setup
1.  Navigate to the `/frontend` folder.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file (if not using default config):
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 🧪 Testing the Logic

### AI Roadmap Test
To test the AI generation logic without using the frontend, use the built-in test script:
```bash
cd backend
node test_ai.js
```
This will print the full AI-generated JSON to your terminal.

---

## ⚠️ Important Development Rules

1.  **Strict JSON**: The AI must always return valid JSON. If you modify the prompt in `geminiService.js`, always run the test script above to verify the output format hasn't broken.
2.  **Tailwind Classes**: We use Tailwind 4 for styling. Ensure your classes are consistent with the existing dark-mode / minimalist aesthetic.
3.  **Error Handling**: Always wrap AI and External API calls in `try-catch` blocks and use the `isRateLimit` checks provided in the code.
4.  **Database Sync**: When adding new fields to the `User` model, remember to check if any controllers (like `authController.js`) need to be updated to sync that new data to previous Roadmaps.

---
*Created for the CampusPath Technical Team.*
