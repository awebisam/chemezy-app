# Technology Stack & Development Guidelines

## Core Technologies
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first responsive design
- **State Management**: Zustand for lightweight, scalable global state
- **HTTP Client**: Axios with interceptors for API communication and authentication
- **Routing**: React Router v6 for client-side navigation
- **Animation**: Framer Motion for smooth transitions and micro-interactions

## Development Tools
- **Linting**: ESLint with React and TypeScript rules
- **Formatting**: Prettier for consistent code style
- **Testing**: Jest + React Testing Library for unit/integration tests
- **E2E Testing**: Playwright for end-to-end testing
- **Type Checking**: TypeScript strict mode enabled

## API Integration
- **Backend**: Chemezy Backend Engine (FastAPI/Python)
- **Authentication**: JWT tokens with automatic refresh
- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Error Handling**: Centralized error handling with user-friendly messages

## Common Commands

### Development
```bash
# Start development server
npm run dev

# Run with specific port
npm run dev -- --port 3000
```

### Building
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Architecture Patterns
- **Component-based**: Reusable UI components with clear interfaces
- **Service Layer**: Dedicated API services for backend communication
- **Store Pattern**: Zustand stores for different domain areas (auth, lab, dashboard)
- **Custom Hooks**: Reusable logic extraction into custom React hooks
- **Error Boundaries**: Graceful error handling at component level

## Performance Guidelines
- Use React.memo for expensive components
- Implement code splitting with React.lazy for routes
- Optimize bundle size with tree shaking
- Use requestAnimationFrame for animations
- Implement proper cleanup in useEffect hooks

## Accessibility Requirements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support for visual effects
- High contrast mode compatibility