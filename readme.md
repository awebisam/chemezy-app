# Chemezy: The Virtual Lab Frontend

Welcome to the frontend repository for Chemezy, the interactive virtual chemistry lab. This project is the visual and interactive layer that brings the powerful Chemezy backend to life, allowing users to experiment, discover, and learn about chemistry in an engaging 2D sandbox environment.

This application is built with React and is designed to be a clean, performant, and user-friendly interface for the powerful Chemezy Backend Engine.

## Core Features

- **Interactive Lab Bench**: A drag-and-drop interface for adding chemicals and catalysts to a virtual beaker.
- **Dynamic Environment Selection**: Users can change the conditions of their experiments (e.g., Vacuum, Pure Oxygen, Acidic) to see different outcomes.
- **Real-time Reaction Visualization**: Displays the products and visual effects of chemical reactions as returned by the backend API.
- **Gamification Dashboard**: A user-centric dashboard to view earned awards, track progress towards new achievements, and see leaderboard rankings.
- **Chemical Inventory**: A searchable list of all available chemicals that users can use in their experiments.
- **Secure User Authentication**: A seamless login/registration flow to manage user sessions and track progress.
- **Educational Explanations**: Clear, concise explanations for each reaction to help users learn the underlying science.

## Tech Stack

- **Framework**: React (using Vite for a fast development experience)
- **Styling**: Tailwind CSS for a utility-first styling workflow.
- **State Management**: Zustand for simple, scalable global state management.
- **API Communication**: Axios for making requests to the backend API.
- **Routing**: React Router for handling client-side navigation.
- **Linting & Formatting**: ESLint and Prettier to maintain code quality and consistency.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- A running instance of the Chemezy Backend Engine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/awebisam/chemezy-frontend.git
   cd chemezy-frontend
    ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**:

   * Create a `.env` file in the root of the project by copying the example file:

     ```bash
     cp .env.example .env
     ```

   * Open the `.env` file and set the URL for your running backend instance:

     ```
     VITE_API_BASE_URL=http://localhost:8000/api/v1
     ```

4. **Run the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Project Structure

```
/src
├── api          # API service layer for communicating with the backend
├── assets       # Static assets like images and icons
├── components   # Reusable UI components (e.g., Button, Modal)
├── hooks        # Custom React hooks
├── pages        # Top-level page components (e.g., Lab, Dashboard)
├── store        # Zustand state management stores
├── styles       # Global CSS and Tailwind configuration
└── App.jsx      # Main application component with routing
```

## Connecting to the Backend

All communication with the backend is handled through the API service layer located in `src/api`. The base URL for all API requests is configured in the `.env` file using the `VITE_API_BASE_URL` variable.

The API service uses an Axios instance that automatically attaches the JWT token to authorized requests after the user logs in.

## Available Scripts

In the project directory, you can run:

* `npm run dev` — Runs the app in development mode.
* `npm run build` — Builds the app for production to the `dist` folder.
* `npm run lint` — Lints the code for errors and warnings.
* `npm run preview` — Serves the production build locally to preview it before deployment.
