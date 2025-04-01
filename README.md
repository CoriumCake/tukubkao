# Tukubkao - Recipe Suggestion App

A mobile application that suggests recipes based on ingredients you have. Built with Expo and React Native, with a Node.js backend that uses Ollama for AI-powered recipe suggestions.

## Features

- Input ingredients and get recipe suggestions
- Authentication with Clerk
- Light and dark mode support
- Cross-platform (iOS, Android, Web)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CoriumCake/tukubkao.git
   cd tukubkao
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Clerk authentication:
   - Create an account at [clerk.dev](https://clerk.dev)
   - Set up your application and get your API keys
   - Create a `.env` file in the project root with your Clerk keys

## Running the Application

### Start the Expo app

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

