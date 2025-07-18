# Chemezy Frontend

An interactive virtual chemistry laboratory for middle and high school students. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🧪 Interactive drag-and-drop chemistry lab
- ⚡ Real-time visual effects for chemical reactions
- 🏆 Achievement system with awards and leaderboards
- 📱 Responsive design for desktop, tablet, and mobile
- 🔒 Secure authentication and user management
- 📊 Progress tracking and reaction history

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your API configuration

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives
│   ├── layout/         # Layout components
│   ├── auth/           # Authentication components
│   ├── lab/            # Lab interface components
│   ├── dashboard/      # Dashboard components
│   └── effects/        # Visual Effects Engine
├── pages/              # Top-level page components
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `VITE_APP_NAME` | Application name | `Chemezy` |
| `VITE_DEV_MODE` | Development mode flag | `true` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.