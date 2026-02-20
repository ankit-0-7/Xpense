# 🚀 Xpense AI: Predictive Finance Manager

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

> **Stop tracking the past. Start predicting the future.**

Most personal finance apps act like digital spreadsheets—they only tell you where your money *went*. I built **Xpense AI** to tell you where your money is *going*. 

By architecting a core **MERN stack** application and bridging it with a **Python/Machine Learning microservice**, this app acts as a personal financial advisor. It audits your habits, forecasts your future expenses, and helps you make smarter decisions in real-time.

---

## ✨ Standout Features

### 🔮 Predictive Forecasting (Machine Learning)
Integrated **Facebook Prophet** (via a Python Flask microservice) to perform time-series forecasting. The app analyzes your historical spending data to predict your expense trajectory for the next 30 days.

### 🧠 GenAI Financial Advisor
Why look at charts when AI can explain them to you? I integrated **Llama-3 (via Groq API)** to act as a personalized financial auditor. It reads your monthly data, identifies risky spending patterns (e.g., *"You are spending 30% more on dining this week"*), and generates human-like advice.

### 🌍 Live Global Currency Engine
Built a dynamic `CurrencyContext` that fetches real-time Forex exchange rates. Users can instantly switch the entire app's display currency or use the animated **Live Rate Checker** to convert currencies on the fly.

### ⚡ Premium, Physics-Based UI
Say goodbye to clunky forms. The frontend is engineered with **React** and **Tailwind CSS**, utilizing **Framer Motion** for silky-smooth, physics-based modal animations and page transitions. Data is brought to life using interactive **Recharts**.

### 🔒 Secure & Seamless Access
Frictionless onboarding using **Google OAuth 2.0** alongside traditional JWT-based email/password authentication. 

---

## 🛠 Tech Stack & Architecture

This project demonstrates the ability to manage a multi-language, microservices-style architecture.

* **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Recharts
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI / Machine Learning:** Python, Flask, Pandas, Facebook Prophet
* **LLM Provider:** Groq API (Llama-3 model)
* **Authentication:** Google Cloud Console (OAuth), JWT

---

## 🚀 Getting Started (Local Setup)

Want to run Xpense AI on your local machine? Follow these steps:

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.9+)
* A [MongoDB](https://www.mongodb.com/) cluster URI
* A [Groq API Key](https://console.groq.com/) for GenAI features

### 2. Clone the Repository
```bash
git clone [https://github.com/YourUsername/modernExpTrac.git](https://github.com/YourUsername/modernExpTrac.git)
cd modernExpTrac
