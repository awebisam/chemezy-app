// Utility types for common patterns

// Generic loading state wrapper
export interface LoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

// Generic async action result
export interface AsyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form validation state
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  isValid: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FormField<T[K]>;
  };
  isValid: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// Component props with common patterns
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: string | null;
  onRetry?: () => void;
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;

// Drag and drop types
export interface DragItem {
  type: string;
  id: string | number;
  data: any;
}

export interface DropResult {
  dropEffect: 'none' | 'copy' | 'link' | 'move';
  item: DragItem;
  target: string;
}

// Animation and effect types
export interface AnimationConfig {
  duration: number;
  easing?: string;
  delay?: number;
}

export interface EffectConfig extends AnimationConfig {
  intensity?: number;
  color?: string;
}

// Search and filter types
export interface SearchParams {
  query: string;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOption<T = any> {
  label: string;
  value: T;
  count?: number;
}

// Modal and dialog types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Theme and styling types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Responsive breakpoint types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}