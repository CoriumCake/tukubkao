# Tukubkao - Recipe Suggestion App

A mobile application that suggests recipes based on ingredients you have. Built with Expo and React Native, with a Node.js backend that uses Ollama for AI-powered recipe suggestions.

## Features

- Input ingredients and get recipe suggestions
- Authentication with Clerk
- Light and dark mode support
- Cross-platform (iOS, Android, Web)
- Powered by Llama 3.3 AI model via Ollama

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Ollama](https://ollama.ai/) - for running the AI model locally

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tukubkao.git
   cd tukubkao
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Ollama:
   - Install Ollama from [ollama.ai](https://ollama.ai/)
   - Pull the Llama 3.3 model:
     ```bash
     ollama pull llama3.3:latest
     ```

4. Set up Clerk authentication:
   - Create an account at [clerk.dev](https://clerk.dev)
   - Set up your application and get your API keys
   - Create a `.env` file in the project root with your Clerk keys

## Running the Application

### 1. Start the Ollama server

Make sure Ollama is running in the background. By default, it should be available at http://localhost:11434.

### 2. Start the backend server

```bash
cd backend
node server.js
```

This will start the Express server on port 3000.

### 3. Start the Expo app

In a new terminal window, from the project root:

```bash
npm run start
```

This will start the Expo development server and provide options to run the app on:
- iOS simulator (press `i`)
- Android emulator (press `a`)
- Web browser (press `w`)
- Physical device using Expo Go app (scan QR code)

## How to Use

1. Sign in or create an account
2. Enter ingredients you have in your kitchen
3. Get AI-generated recipe suggestions based on your ingredients
4. Explore the suggested recipes

## Project Structure

- `/app` - Main application code using Expo Router for navigation
- `/backend` - Express server that communicates with Ollama
- `/components` - Reusable React components
- `/hooks` - Custom React hooks
- `/constants` - Application constants and theme settings

## Development

This project uses:
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing
- [NativeWind](https://www.nativewind.dev/) for styling with Tailwind CSS
- [Clerk](https://clerk.dev/) for authentication
- [Ollama](https://ollama.ai/) for local AI model hosting

## License

[MIT License](LICENSE)

