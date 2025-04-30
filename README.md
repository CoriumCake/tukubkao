# 🍳 Tukubkao - AI Recipe Companion

**Never wonder "What's for dinner?" again**  
A cross-platform culinary assistant that transforms your ingredients into delicious recipes using AI.

## ✨ Key Features

- **AI-Powered Suggestions**  
  Get personalized recipes using Deepseek's natural language processing
- **Pantry Intelligence**  
  Smart ingredient matching with substitution suggestions
- **Universal Access**  
  Seamless experience across iOS, Android, and Web
- **Adaptive Design**  
  Auto-switching light/dark themes with NativeWind styling
- **Secure Auth**  
  Supabase-powered authentication with OAuth support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ & npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)
- Deepseek API access (or Ollama local setup)

### Installation
```bash
git clone https://github.com/CoriumCake/tukubkao.git
cd tukubkao
npm install
```

## 🖥️ Development Setup

### Running the App
```bash
# Start Expo development server
npm run start

# For specific platforms
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Local browser
```

### Backend Configuration
1. Create `.env` in `/backend`:
```
DEEPSEEK_API_KEY=your_key_here
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
```
2. Start backend server:
```bash
cd backend
npm run dev
```

## 🧑‍🍳 How It Works

1. **User Authentication**  
   Secure login via Supabase Auth
2. **Ingredient Input**  
   Add items manually or scan barcodes
3. **AI Processing**  
   Backend generates recipes using Deepseek
4. **Recipe Display**  
   Interactive cards with cooking instructions

## 🏗️ Project Architecture
```
tukubkao/
├── app/              # Expo Router entry point
│   ├── components/   # Shared UI components
│   ├── hooks/        # Custom React hooks
│   └── constants/    # Theme & configuration
├── backend/          # Node.js API server
│   ├── routes/       # API endpoints
│   └── services/     # AI integration
├── assets/           # Images & fonts
└── tests/            # Jest test suites
```

## 🛠️ Tech Stack

**Frontend**
- Expo + React Native
- NativeWind (Tailwind for React Native)
- Expo Router (File-based navigation)

**Backend**
- Node.js + Express
- Ollama/Deepseek integration
- Supabase Client

## 🌱 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📜 License

MIT License - see [LICENSE](LICENSE) for details

## 🙋 Support

For help or questions:
- Open a GitHub issue
- Contact: your.email@example.com
