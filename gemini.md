# Chemezy Frontend - Project Context

## Key Project Files
Always reference these files when working on tasks:

### Project Specifications
- `.kiro/specs/chemezy-frontend/requirements.md` - User stories and acceptance criteria  
- `.kiro/specs/chemezy-frontend/design.md` - Architecture and component design
- `.kiro/specs/chemezy-frontend/tasks.md` - Implementation plan with 24 tasks

### Project Guidelines
- `.kiro/steering/product.md` - Product overview and value proposition
- `.kiro/steering/structure.md` - File organization and naming conventions
- `.kiro/steering/tech.md` - Technology stack and development guidelines

## Development Commands
```bash
# Development
npm run dev              # Start dev server on port 3000
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Lint code
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run type-check      # TypeScript type checking

# Testing
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
```

## Project Status
- Task 1: ✅ Complete - Project foundation and development environment set up
- Task 2: ✅ Complete - Core TypeScript type definitions
- Task 3: ✅ Complete - API service layer with authentication
- Task 4: ✅ Complete - Zustand stores for state management
- Task 5: ✅ Complete - Build authentication system components
- Tailwind v4 Configuration: ✅ Complete - Fixed all configuration issues
- Current Phase: Ready for Task 6 (Develop basic UI component library)

## Key Architecture Points
- React 18 + TypeScript + Vite
- Zustand for state management
- Tailwind CSS v4 for styling (CSS-based theme configuration)
- Axios for API communication
- Visual Effects Engine for chemistry animations
- Component-based architecture with clear separation of concerns

## Tailwind v4 Configuration Notes
**IMPORTANT**: This project uses Tailwind CSS v4, which has different configuration from v3:
- Use `@import "tailwindcss"` (not `@tailwind` directives)
- Custom theme defined in CSS using `@theme` blocks
- No external plugins needed (`@tailwindcss/forms` not required)
- Minimal `tailwind.config.js` with just content paths

**If you see errors like "Cannot apply unknown utility class":**
1. Check that custom colors are defined in `@theme` block in `src/index.css`
2. Avoid circular references in component classes
3. Don't install v3 plugins - they're built into v4

## API Integration
- Backend: Chemezy Backend Engine (FastAPI)
- Base URL: `VITE_API_BASE_URL` environment variable
- Authentication: JWT tokens with automatic refresh
- Main endpoints: `/auth`, `/chemicals`, `/reactions`, `/awards`