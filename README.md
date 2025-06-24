🧠 Zehni — Speak your mind. Let AI hold it gently.
Zehni is a voice journaling web app made especially for Pakistanis. Speak your thoughts in Urdu, and Zehni will listen, understand your mood, and respond with empathy.
No sign-ups. No names. Just you and your thoughts.

<!-- Optional banner image if you have it -->

✨ Features
🎙️ Voice Journaling in Urdu (powered by browser speech recognition)

💬 AI-Powered Summarization & Mood Detection

😌 Soothing AI replies in Urdu

📜 All entries are saved anonymously to a shared feed

🌐 Built for Pakistan, but anyone can try it!

🛠️ Tech Stack
Frontend	Backend	Database	Other
React + Vite	Express + Drizzle ORM	Neon (PostgreSQL)	Deployed on Render
Speech-to-text using browser WebSpeech API
AI response via OpenRouter

🧪 Why I Built This
I wanted to create a soft little app that lets people vent. Especially in Urdu. Especially anonymously.
Zehni was born out of late nights, emotional debugging, and a desire to give people space — even if it's virtual.

This started as a Replit prototype (!) — I didn’t expect it to grow this far but here we are 🚀

🐛 Known Quirks
All entries are tied to a test user for now (since login isn’t implemented yet).

Anyone can see the shared journal feed — but entries are anonymous.

Browser support depends on SpeechRecognition API (works best in Chrome).

📦 Setup & Run
bash
Copy
Edit
# Clone & install
git clone https://github.com/yourusername/zehni.git
cd zehni
npm install

# Add your environment variables
touch .env
# Add DATABASE_URL and OPENROUTER_API_KEY

# Push Drizzle schema (if needed)
npm run drizzle:push

# Build & start
npm run build
npm start
💡 What I’d Love to Add
User login

Sentiment trend graph over time

Language model fine-tuned on local dialects
