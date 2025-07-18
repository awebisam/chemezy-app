# Project Structure & Organization

## Root Directory Structure
```
/
├── src/                 # Source code
├── public/              # Static assets served directly
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
└── README.md            # Project documentation
```

## Source Code Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI primitives (Button, Input, Modal)
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── auth/           # Authentication-related components
│   ├── lab/            # Lab interface components
│   ├── dashboard/      # Dashboard and awards components
│   └── effects/        # Visual Effects Engine components
├── pages/              # Top-level page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── LabPage.tsx
│   └── LeaderboardPage.tsx
├── hooks/              # Custom React hooks
├── services/           # API service layer
│   ├── api.ts          # Axios configuration
│   ├── auth.service.ts
│   ├── chemical.service.ts
│   ├── reaction.service.ts
│   └── awards.service.ts
├── store/              # Zustand state management
│   ├── auth.store.ts
│   ├── lab.store.ts
│   ├── dashboard.store.ts
│   └── chemical.store.ts
├── types/              # TypeScript type definitions
│   ├── api.types.ts    # API response types
│   ├── chemical.types.ts
│   ├── reaction.types.ts
│   └── award.types.ts
├── utils/              # Utility functions
├── assets/             # Images, icons, and static files
├── styles/             # Global CSS and Tailwind imports
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Component Organization Patterns

### UI Components (`src/components/ui/`)
- **Button.tsx**: Reusable button with variants (primary, secondary, danger)
- **Input.tsx**: Form input with validation states
- **Modal.tsx**: Reusable modal with backdrop and accessibility
- **LoadingSpinner.tsx**: Loading indicators
- **Toast.tsx**: Notification system

### Lab Components (`src/components/lab/`)
- **LabBench.tsx**: Main experiment workspace
- **ChemicalInventory.tsx**: Chemical browser and search
- **ChemicalCard.tsx**: Individual chemical display with drag
- **EnvironmentSelector.tsx**: Experiment environment selection
- **ReactionTrigger.tsx**: Button to start reactions
- **ResultsDisplay.tsx**: Reaction results and explanations

### Effects Components (`src/components/effects/`)
- **EffectsRenderer.tsx**: Main effects orchestrator
- **GasEffect.tsx**: Gas production animations
- **LightEffect.tsx**: Light emission effects
- **TemperatureEffect.tsx**: Temperature change indicators
- **FoamEffect.tsx**: Foam production animations
- **StateChangeEffect.tsx**: Matter state transitions
- **VolumeChangeEffect.tsx**: Expansion/contraction effects
- **SpillEffect.tsx**: Liquid spilling animations
- **TextureChangeEffect.tsx**: Surface texture changes

## File Naming Conventions
- **Components**: PascalCase with `.tsx` extension (e.g., `ChemicalCard.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAuth.ts`)
- **Services**: camelCase with `.service.ts` suffix (e.g., `auth.service.ts`)
- **Stores**: camelCase with `.store.ts` suffix (e.g., `lab.store.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `api.types.ts`)
- **Utils**: camelCase with `.ts` extension (e.g., `formatters.ts`)

## Import Organization
```typescript
// 1. React and external libraries
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Internal services and stores
import { useAuthStore } from '@/store/auth.store';
import { chemicalService } from '@/services/chemical.service';

// 3. Components (UI first, then feature-specific)
import { Button } from '@/components/ui/Button';
import { ChemicalCard } from '@/components/lab/ChemicalCard';

// 4. Types
import type { Chemical } from '@/types/chemical.types';

// 5. Utils and constants
import { formatChemicalName } from '@/utils/formatters';
```

## Environment Configuration
- **Development**: `.env.local` for local overrides
- **Production**: Environment variables set in deployment platform
- **Required Variables**:
  - `VITE_API_BASE_URL`: Backend API base URL
  - `VITE_APP_NAME`: Application name for branding

## Asset Organization
```
src/assets/
├── images/             # Static images
│   ├── icons/         # SVG icons
│   ├── backgrounds/   # Background images
│   └── chemicals/     # Chemical structure images
├── fonts/             # Custom fonts (if any)
└── data/              # Static JSON data files
```

## Testing Structure
```
src/
├── __tests__/         # Global test utilities
├── components/
│   └── __tests__/     # Component tests
├── services/
│   └── __tests__/     # Service tests
├── store/
│   └── __tests__/     # Store tests
└── utils/
    └── __tests__/     # Utility tests
```

## Build Output Structure
```
dist/
├── assets/            # Bundled CSS and JS files
├── images/            # Optimized images
├── index.html         # Main HTML file
└── favicon.ico        # Application icon
```