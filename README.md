# ⚡ NexusAI — Production-Grade AI Assistant Chatbot

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-v1.5-blue?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

NexusAI is a production-grade AI assistant chatbot application built from the ground up to feel like a premium SaaS product. It leverages Node.js/Express.js on the backend, React/TypeScript/Tailwind CSS on the frontend, and links directly to Google's Gemini API for multi-turn conversations and customized persona prompts.

---

## 🎨 Screenshots & Design System

> **Theme:** Dark mode by default (with seamless light mode toggle mapping customized CSS variables).
> **Aesthetics:** Glassmorphism headers, electric-purple glowing panels, custom-tailored bouncing typing dots, code snippet editor-blocks, and smooth Framer Motion list stagger entries.

---

## 🚀 Key Features

*   **💬 Multi-Conversation Sidebar:**
    *   Saves active chats to browser `localStorage` automatically.
    *   Auto-generates chat titles based on the first prompt content.
    *   Slide animations on mobile panels (collapsible into drawers).
*   **🛠️ AI Persona System:**
    *   **Default Assistant:** General helpful and concise AI.
    *   **Code Helper:** Programming helper with syntax highlighted code blocks and step explanations.
    *   **Creative Writer:** Storytelling and imaginative poetry content assistant.
    *   **Data Analyst:** Analytical summary structures and tables.
*   **⚙️ Settings Modal:**
    *   Local API Key override (enables porting frontend to other servers).
    *   Model selection toggle (`gemini-1.5-flash` / `gemini-1.5-pro`).
    *   Max output tokens slider & Temperature (creativity level) parameters.
    *   Clear conversations list trigger.
*   **📤 Export Utilities:**
    *   Allows downloading the active chat thread compiled directly as a `.md` (Markdown) file.
*   **🧑‍💻 Syntax Highlighted Code Blocks:**
    *   Embeds copy-to-clipboard actions on code headers and whole bubbles.
*   **🛡️ Robust Backend:**
    *   Security headers through `helmet`, CORS filters, structured error handling, and `express-rate-limit` capped at 20 queries/minute per IP.

---

## 💻 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (Vite), TypeScript | Component-driven UI client |
| **Styles / Motion** | Tailwind CSS, Framer Motion | Smooth layout animations and custom CSS variables |
| **API Client** | Axios | Network requests handler |
| **Markdown Parser** | React Markdown | Converts AI responses to HTML tags |
| **Icons & Toasts** | Lucide React, React Hot Toast | Icon sets and notifications |
| **Backend** | Node.js, Express, TypeScript | Highly scalable application server |
| **AI Integration** | `@google/generative-ai` | Interface layer to Google Gemini models |
| **Security** | Helmet, CORS, Rate Limiters | Restricts headers and spam attacks |

---

## 📂 Project Structure

```text
ai-chatbot/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.ts               # Chat endpoints and health check
│   │   ├── middleware/
│   │   │   ├── rateLimiter.ts        # Rate limit checks (20 req/min)
│   │   │   └── errorHandler.ts       # Express central JSON error mapping
│   │   ├── services/
│   │   │   └── geminiService.ts      # Gemini API integrations and persona system instructions
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript request/response types
│   │   └── index.ts                  # Server setup and CORS
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx        # Message lists and scroll control
│   │   │   ├── MessageBubble.tsx     # Markdown output + custom CodeBlock + hover copies
│   │   │   ├── InputBar.tsx          # Multi-line text box + persona selector
│   │   │   ├── Sidebar.tsx           # Active conversations list + sliding panel drawer
│   │   │   ├── Header.tsx            # Glowing branding title + stats counter + toggles
│   │   │   ├── TypingIndicator.tsx   # Three bouncing dot ellipsis indicators
│   │   │   └── WelcomeScreen.tsx     # Animated suggestion quick start cards
│   │   ├── hooks/
│   │   │   ├── useChat.ts            # Core state hook (sendMessage, export, createChat)
│   │   │   └── useLocalStorage.ts    # React state to localStorage sync sync hook
│   │   ├── types/
│   │   │   └── index.ts              # Conversions, messages, and configurations types
│   │   ├── utils/
│   │   │   └── formatMessage.ts      # Export formatting and date helpers
│   │   ├── App.tsx                   # Page layout structure and settings modal
│   │   ├── main.tsx                  # React entry file
│   │   └── index.css                 # Base theme properties mapping CSS variables
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- A Google Gemini API Key (obtained free from [Google AI Studio](https://aistudio.google.com))

### 1. Clone & Scaffolding
Clone the repository and inspect the folder structure:
```bash
git clone https://github.com/your-username/ai-chatbot.git
cd ai-chatbot
```

### 2. Configure Backend Server
Navigate to the `backend/` directory, install packages, and create the `.env` file:
```bash
cd backend
npm install

# Copy example environment configuration
cp .env.example .env
```
Edit `.env` and fill in your details:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```
Build and start the server:
```bash
# Start backend in hot-reload development mode
npm run dev

# Or compile and run in production
npm run build
npm start
```
The server will boot on `http://localhost:5000`. Verify its health state via `http://localhost:5000/api/health`.

### 3. Configure Frontend Client
In a separate terminal, enter the `frontend/` directory, install dependencies, and create the `.env` file:
```bash
cd frontend
npm install

# Copy example environment configuration
cp .env.example .env
```
Ensure `.env` matches the backend endpoint:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=NexusAI
```
Start the client application:
```bash
npm run dev
```
Open your browser to the local server, typically `http://localhost:5173`.

---

## ⚡ API Endpoints

### 1. POST `/api/chat`
Sends a query along with preceding dialog history to get generated chatbot answers.
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "message": "Write a python function to check if a number is prime",
    "conversationHistory": [
      { "role": "user", "content": "Hello!" },
      { "role": "model", "content": "Hi there! I am NexusAI. How can I help you today?" }
    ],
    "persona": "code",
    "model": "gemini-1.5-flash",
    "temperature": 0.5,
    "apiKey": "AIzaSy..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "response": "Here is the Python function...\n\n```python\ndef is_prime(n):\n...",
    "tokensUsed": 194,
    "conversationId": "7d9539cc-82f5-410f-8b2f-762bc2b54203"
  }
  ```

### 2. GET `/api/health`
Checks backend health metrics and uptime details.
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "uptime": 2341,
    "version": "1.0.0",
    "timestamp": "2026-06-17T11:05:12.431Z"
  }
  ```

---

## 🚀 Deployment Instructions

### Deploying the Backend (e.g. on Render.com)
1. Register/Login on Render.com and select **New Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
4. Under Environment variables, add:
   - `PORT=10000`
   - `GEMINI_API_KEY=your_gemini_api_key`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`

### Deploying the Frontend (e.g. on Vercel)
1. Register/Login on Vercel and select **Add New Project**.
2. Connect your Git repository.
3. Set the **Root Directory** as `frontend`.
4. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Under environment variables, add:
   - `VITE_API_URL=https://your-backend-domain.onrender.com`
   - `VITE_APP_NAME=NexusAI`
6. Click **Deploy**.

---

## 🤝 Contributing
Feel free to open issues or submit PRs if you want to extend capabilities (such as file inputs, voice outputs, or vector embeddings).

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
