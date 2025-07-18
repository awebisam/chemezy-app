# Requirements Document

## Introduction

The Chemezy Frontend is an interactive virtual chemistry lab designed for middle and high school students. It provides a game-like interface that connects to the Chemezy Backend Engine, allowing students to experiment with chemical reactions in a safe, engaging 2D sandbox environment. The application emphasizes visual discovery, clear feedback, and educational value while maintaining simplicity and intuitive controls.

## Requirements

### Requirement 1

**User Story:** As a student, I want to create an account and log into the application, so that I can track my progress and save my discoveries.

#### Acceptance Criteria

1. WHEN a new user visits the application THEN the system SHALL display registration and login options
2. WHEN a user provides valid registration details (username, email, password) THEN the system SHALL create a new account using the `/api/v1/auth/register` endpoint
3. WHEN a user provides valid login credentials THEN the system SHALL authenticate using the `/api/v1/auth/token` endpoint and store the JWT token
4. WHEN a user is authenticated THEN the system SHALL automatically include the JWT token in all subsequent API requests
5. WHEN a user's session expires THEN the system SHALL redirect to the login page and clear stored credentials
6. WHEN a user logs out THEN the system SHALL clear all stored authentication data and redirect to the login page

### Requirement 2

**User Story:** As a student, I want to browse and search through available chemicals, so that I can understand what materials are available for my experiments.

#### Acceptance Criteria

1. WHEN a user accesses the chemical inventory THEN the system SHALL display all chemicals using the `/api/v1/chemicals/` endpoint with pagination
2. WHEN a user searches for chemicals THEN the system SHALL filter the displayed chemicals based on molecular formula or common name
3. WHEN a user views a chemical THEN the system SHALL display its molecular formula, common name, state of matter, color, density, and properties
4. WHEN a user selects a chemical THEN the system SHALL allow them to add it to their lab bench for experimentation
5. WHEN the chemical list is empty or loading THEN the system SHALL display appropriate loading or empty state messages

### Requirement 3

**User Story:** As a student, I want to drag and drop chemicals onto a virtual lab bench, so that I can set up experiments intuitively.

#### Acceptance Criteria

1. WHEN a user drags a chemical from the inventory THEN the system SHALL provide visual feedback during the drag operation
2. WHEN a user drops a chemical onto the lab bench THEN the system SHALL add the chemical to the current experiment setup
3. WHEN a user adds a chemical to the lab bench THEN the system SHALL allow them to specify the quantity using input controls
4. WHEN a user wants to remove a chemical THEN the system SHALL provide a clear way to remove it from the experiment
5. WHEN a user has chemicals on the lab bench THEN the system SHALL display them in a visually clear and organized manner
6. WHEN a user drags a chemical to an invalid drop zone THEN the system SHALL provide visual feedback and reject the drop

### Requirement 4

**User Story:** As a student, I want to select different experimental environments, so that I can see how conditions affect chemical reactions.

#### Acceptance Criteria

1. WHEN a user sets up an experiment THEN the system SHALL provide environment options including Earth (Normal), Vacuum, Pure Oxygen, Inert Gas, Acidic Environment, and Basic Environment
2. WHEN a user selects an environment THEN the system SHALL visually indicate the current environment selection
3. WHEN a user changes the environment THEN the system SHALL update the experiment parameters for the next reaction
4. WHEN a user runs a reaction THEN the system SHALL include the selected environment in the API request to `/api/v1/reactions/react`
5. WHEN an environment affects the reaction outcome THEN the system SHALL clearly communicate this in the reaction explanation

### Requirement 5

**User Story:** As a student, I want to trigger chemical reactions and see immediate visual feedback, so that I can understand what happens when chemicals interact.

#### Acceptance Criteria

1. WHEN a user has added chemicals to the lab bench THEN the system SHALL provide a clear "React" or "Mix" button to trigger the reaction
2. WHEN a user triggers a reaction THEN the system SHALL send a request to `/api/v1/reactions/react` with the selected reactants, quantities, environment, and optional catalyst
3. WHEN the API returns a reaction prediction THEN the system SHALL display the resulting products with their names, formulas, and quantities
4. WHEN the API returns visual effects THEN the system SHALL render all effects using the Visual Effects Engine component
5. WHEN a reaction is a world-first discovery THEN the system SHALL prominently highlight this achievement to the user
6. WHEN a reaction completes THEN the system SHALL display the scientific explanation provided by the API
7. WHEN a reaction fails or returns an error THEN the system SHALL display a clear error message to the user

### Requirement 6

**User Story:** As a student, I want to see dynamic visual effects during reactions, so that I can better understand and engage with the chemical processes.

#### Acceptance Criteria

1. WHEN the system receives effect data from the API THEN the Visual Effects Engine SHALL render all effect types including gas_production, light_emission, temperature_change, foam_production, state_change, volume_change, spill, and texture_change
2. WHEN rendering gas_production effects THEN the system SHALL display animated gas with the specified color, intensity, and duration
3. WHEN rendering light_emission effects THEN the system SHALL display light with the specified color, intensity, radius, and duration
4. WHEN rendering temperature_change effects THEN the system SHALL provide visual indicators of heating or cooling based on the delta_celsius value
5. WHEN rendering foam_production effects THEN the system SHALL display animated foam with the specified color, density, bubble_size, and stability
6. WHEN rendering state_change effects THEN the system SHALL visually transition the affected chemical to its new state
7. WHEN rendering volume_change effects THEN the system SHALL animate the expansion or contraction based on the factor value
8. WHEN rendering spill effects THEN the system SHALL animate liquid spreading based on amount_percentage and spread_radius
9. WHEN rendering texture_change effects THEN the system SHALL update the visual appearance based on texture_type, color, and viscosity
10. WHEN multiple effects occur simultaneously THEN the system SHALL render all effects without visual conflicts or performance issues
11. WHEN effects have duration parameters THEN the system SHALL automatically stop the effect after the specified time
12. WHEN effects are rendered THEN the system SHALL use procedurally generated SVG for all dynamic visual elements

### Requirement 7

**User Story:** As a student, I want to view my earned awards and track my progress, so that I can see my achievements and stay motivated to continue experimenting.

#### Acceptance Criteria

1. WHEN a user accesses their dashboard THEN the system SHALL display their awards using the `/api/v1/awards/me` endpoint
2. WHEN displaying awards THEN the system SHALL show the award name, description, category, tier, and date earned
3. WHEN a user views their dashboard THEN the system SHALL display their progress toward unearned awards using the `/api/v1/awards/available` endpoint
4. WHEN showing award progress THEN the system SHALL provide clear visual indicators of how close the user is to earning each award
5. WHEN a user earns a new award THEN the system SHALL display a celebration notification or animation
6. WHEN a user wants to filter awards THEN the system SHALL allow filtering by category (discovery, database_contribution, community, special, achievement)
7. WHEN displaying awards THEN the system SHALL organize them in a visually appealing and easy-to-understand layout

### Requirement 8

**User Story:** As a student, I want to see how I rank compared to other users, so that I can understand my progress relative to my peers.

#### Acceptance Criteria

1. WHEN a user accesses the leaderboard THEN the system SHALL display rankings using the `/api/v1/awards/leaderboard/overall` endpoint
2. WHEN displaying leaderboard data THEN the system SHALL show user rank, username, award count, and total points
3. WHEN a user views category-specific leaderboards THEN the system SHALL use the `/api/v1/awards/leaderboard/{category}` endpoint for each category
4. WHEN a user wants to see their own rank THEN the system SHALL display their position using the `/api/v1/awards/leaderboard/my-rank` endpoint
5. WHEN leaderboard data is loading THEN the system SHALL display appropriate loading indicators
6. WHEN leaderboard data is unavailable THEN the system SHALL display a clear message explaining the situation

### Requirement 9

**User Story:** As a student, I want the application to work smoothly on different devices, so that I can use it on school computers, tablets, or at home.

#### Acceptance Criteria

1. WHEN a user accesses the application on different screen sizes THEN the system SHALL provide a responsive layout that works on desktop, tablet, and mobile devices
2. WHEN a user interacts with drag-and-drop on touch devices THEN the system SHALL support touch-based dragging and dropping
3. WHEN the application loads THEN the system SHALL display loading states and handle slow network connections gracefully
4. WHEN API requests fail THEN the system SHALL provide clear error messages and retry options where appropriate
5. WHEN a user navigates between pages THEN the system SHALL maintain smooth transitions and preserve user context where appropriate

### Requirement 10

**User Story:** As a student, I want to view my reaction history and statistics, so that I can track my experimentation progress over time.

#### Acceptance Criteria

1. WHEN a user accesses their reaction history THEN the system SHALL display cached reactions using the `/api/v1/reactions/cache` endpoint
2. WHEN displaying reaction history THEN the system SHALL show the reactants used, products created, and date of each reaction
3. WHEN a user views their statistics THEN the system SHALL display total reactions and discoveries using the `/api/v1/reactions/stats` endpoint
4. WHEN a user wants to repeat a previous reaction THEN the system SHALL allow them to easily recreate the same experiment setup
5. WHEN displaying reaction history THEN the system SHALL organize reactions chronologically with clear visual separation