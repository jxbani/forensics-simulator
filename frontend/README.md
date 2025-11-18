# Forensics Simulator - Frontend

React-based frontend application for the Digital Forensics Training Simulator, built with Vite, React Router, and Tailwind CSS.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ToolSelector.jsx
│   │   ├── FileUpload.jsx
│   │   ├── ActiveTools.jsx
│   │   └── ui/             # Base UI components
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── LevelView.jsx
│   │   ├── Leaderboard.jsx
│   │   └── ForensicLab.jsx
│   ├── services/           # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── levelService.js
│   │   ├── toolService.js
│   │   └── fileService.js
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── .env.example
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend/README.md)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env if backend URL is different
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🔐 Environment Variables

Configure in `.env` file:

```bash
# API Configuration (required)
VITE_API_URL=http://localhost:5000/api
```

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the application.

## 🎨 Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📱 Key Features

- **Authentication** - Login/Register with JWT tokens
- **Dashboard** - Level overview and progress tracking
- **Level System** - Interactive tasks with hints and validation
- **Forensic Lab** - Tool launcher with file upload
- **Leaderboard** - Global and level-specific rankings
- **Admin Dashboard** - User and content management

## 🔧 Development

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  return (
    <div className="container">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Create service methods if needed
4. Add navigation links

## 🎨 Styling

This project uses Tailwind CSS for styling:

- Use utility classes for styling
- Follow mobile-first responsive design
- Create custom components in `src/components/ui/` for reusable UI

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

Output will be in `dist/` directory.

### Deployment

The built files can be served by any static hosting service (Netlify, Vercel, AWS S3, etc.).

## 🐛 Troubleshooting

### API Connection Issues
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env`
- Verify CORS settings in backend

### Build Errors
```bash
rm -rf dist node_modules
npm install
npm run build
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

ISC
