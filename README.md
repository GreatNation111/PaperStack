# PaperStack - Curated Past Examination Questions

A React + TypeScript PWA application providing curated past examination questions for Nigerian universities. Built with Vite, Tailwind CSS, Firebase, and Framer Motion.

## Project Overview

PaperStack is a platform that makes it easy for students to access verified past examination questions organized by department and year. Features include:

- 📚 Equal access to past questions (no more begging seniors for incomplete sets)
- 🔍 Search & filter by course code, year, and exam type
- 🔖 Save & bookmark favorites for quick access
- 📊 Lecturer repeat insights (see which questions repeat year after year)
- 💡 Detailed solutions & high-yield question packs

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/paperstack.git
cd paperstack
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Firebase credentials to `.env.local`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running Locally

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── app/
│   ├── components/          # React components
│   │   ├── Welcome.tsx      # Welcome/onboarding screen
│   │   ├── SignIn.tsx       # Sign in page
│   │   ├── SignUp.tsx       # Sign up page
│   │   ├── Home.tsx         # Home screen
│   │   ├── Explore.tsx      # Browse questions
│   │   ├── Library.tsx      # Bookmarks/saved items
│   │   ├── Profile.tsx      # User profile
│   │   └── ...              # Other components
│   ├── context/             # React context (Auth, etc)
│   ├── cards/               # Route guards & utilities
│   └── App.tsx              # Main app component
├── lib/
│   └── firebase.ts          # Firebase configuration
├── styles/                  # Global styles & CSS
└── main.tsx                 # App entry point
```

## Features

- 🎨 Beautiful UI with smooth animations
- 📱 Mobile-first responsive design
- 🔐 Firebase authentication (email & Google sign-in)
- 🔄 Real-time data with Firestore
- 🎯 Route guards for protected pages
- 📲 PWA capabilities for offline use

## Environment Variables

See `.env.example` for all required Firebase configuration variables. Never commit `.env` files - they contain sensitive credentials.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private. All rights reserved.

## Design Reference

Original design: https://www.figma.com/design/QOzZXpRmxsr18uUCN3MJis/Design-PaperStack-PWA-App

## Support

For questions or issues, please open a GitHub issue.