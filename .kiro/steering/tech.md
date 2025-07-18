# Technology Stack & Development Guidelines

## Core Technologies
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS v4 for utility-first responsive design
- **State Management**: Zustand for lightweight, scalable global state
- **HTTP Client**: Axios with interceptors for API communication and authentication
- **Routing**: React Router v6 for client-side navigation
- **Animation**: Framer Motion for smooth transitions and micro-interactions

## Development Tools
- **Linting**: ESLint with React and TypeScript rules
- **Formatting**: Prettier for consistent code style
- **Testing**: Vitest + React Testing Library for unit/integration tests
- **E2E Testing**: Playwright for end-to-end testing
- **Type Checking**: TypeScript strict mode enabled

## Tailwind CSS v4 Configuration
- **Version**: Tailwind CSS v4.1.11 (latest major version)
- **Configuration**: CSS-based theme definition using `@theme` blocks
- **Custom Theme**: Primary and secondary color palettes defined in `src/index.css`
- **No Plugins**: v4 has built-in functionality, no external plugins needed
- **Import Style**: Use `@import "tailwindcss"` instead of separate `@tailwind` directives

### Key v4 Differences from v3:
- **Theme Definition**: Use CSS custom properties (`--color-primary-500`) instead of JS config
- **Plugin System**: Built-in plugins replace external packages like `@tailwindcss/forms`
- **Configuration**: Minimal `tailwind.config.js`, theme in CSS
- **Import Syntax**: Single `@import "tailwindcss"` replaces three separate imports

### Custom Theme Variables:
```css
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-600: #2563eb;
  --color-secondary-500: #22c55e;
  --animate-bounce-slow: bounce 2s infinite;
}
```

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

## Common Tailwind v4 Troubleshooting

### Issue: "Cannot apply unknown utility class"
**Solution**: Ensure you're using the correct v4 configuration:
- Use `@import "tailwindcss"` in CSS (not `@tailwind` directives)
- Define custom colors in `@theme` blocks with CSS custom properties
- Don't reference custom component classes in `@apply` (avoid circular references)

### Issue: "Package path ./forms is not exported"
**Solution**: Remove v3 plugin packages:
```bash
npm uninstall @tailwindcss/forms @tailwindcss/typography
```
These are built-in to v4 and don't need separate installation.

### Issue: "Cannot use 'in' operator to search for '__isOptionsFunction'"
**Solution**: This means v3 plugins are still referenced. Check:
- Remove plugins from `tailwind.config.js`
- Don't use `require()` syntax for plugins in v4
- Use empty `plugins: []` array in config

### Working v4 Configuration:
```javascript
// tailwind.config.js - Keep minimal
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
}
```

```css
/* src/index.css - Theme definition */
@import "tailwindcss";

@theme {
  --color-primary-600: #2563eb;
  /* other custom properties */
}
```