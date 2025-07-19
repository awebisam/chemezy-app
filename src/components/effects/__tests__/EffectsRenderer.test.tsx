import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { EffectsRenderer } from '../EffectsRenderer';
import type { VisualEffect } from '@/types/reaction.types';

// Mock requestAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
});

// Mock matchMedia for reduced motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? false : true,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('EffectsRenderer', () => {
  const defaultProps = {
    effects: [],
    containerSize: { width: 400, height: 300 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 16); // Simulate 60fps
      return 1;
    });
  });

  it('renders without effects', () => {
    render(<EffectsRenderer {...defaultProps} />);
    
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '400');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('renders gas production effect', async () => {
    const gasEffect: VisualEffect = {
      effect_type: 'gas_production',
      gas_type: 'oxygen',
      color: '#00ff00',
      intensity: 0.8,
      duration: 2,
    };

    render(<EffectsRenderer {...defaultProps} effects={[gasEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    // Check that animation frame was requested
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('renders light emission effect', async () => {
    const lightEffect: VisualEffect = {
      effect_type: 'light_emission',
      color: '#ffff00',
      intensity: 0.9,
      radius: 2.5,
      duration: 3,
    };

    render(<EffectsRenderer {...defaultProps} effects={[lightEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('renders temperature change effect', async () => {
    const tempEffect: VisualEffect = {
      effect_type: 'temperature_change',
      delta_celsius: 50,
    };

    render(<EffectsRenderer {...defaultProps} effects={[tempEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('renders foam production effect', async () => {
    const foamEffect: VisualEffect = {
      effect_type: 'foam_production',
      color: '#ffffff',
      density: 0.7,
      bubble_size: 'medium',
      stability: 4,
    };

    render(<EffectsRenderer {...defaultProps} effects={[foamEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('renders state change effect', async () => {
    const stateEffect: VisualEffect = {
      effect_type: 'state_change',
      initial_state: 'solid',
      final_state: 'liquid',
    };

    render(<EffectsRenderer {...defaultProps} effects={[stateEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('renders volume change effect', async () => {
    const volumeEffect: VisualEffect = {
      effect_type: 'volume_change',
      factor: 1.5,
    };

    render(<EffectsRenderer {...defaultProps} effects={[volumeEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('renders spill effect', async () => {
    const spillEffect: VisualEffect = {
      effect_type: 'spill',
      amount_percentage: 0.3,
      spread_radius: 2.0,
    };

    render(<EffectsRenderer {...defaultProps} effects={[spillEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('renders texture change effect', async () => {
    const textureEffect: VisualEffect = {
      effect_type: 'texture_change',
      texture_type: 'crystalline',
      color: '#0000ff',
      viscosity: 0.5,
    };

    render(<EffectsRenderer {...defaultProps} effects={[textureEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('handles multiple simultaneous effects', async () => {
    const effects: VisualEffect[] = [
      {
        effect_type: 'gas_production',
        gas_type: 'hydrogen',
        color: '#ff0000',
        intensity: 0.5,
        duration: 2,
      },
      {
        effect_type: 'light_emission',
        color: '#00ff00',
        intensity: 0.8,
        radius: 1.5,
        duration: 3,
      },
    ];

    render(<EffectsRenderer {...defaultProps} effects={effects} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('calls onEffectComplete when effect finishes', async () => {
    const onEffectComplete = vi.fn();
    const shortEffect: VisualEffect = {
      effect_type: 'temperature_change',
      delta_celsius: 25,
    };

    render(
      <EffectsRenderer
        {...defaultProps}
        effects={[shortEffect]}
        onEffectComplete={onEffectComplete}
      />
    );

    // Fast-forward time to complete the effect
    act(() => {
      vi.advanceTimersByTime(3000); // Temperature effect duration
    });

    await waitFor(() => {
      expect(onEffectComplete).toHaveBeenCalled();
    });
  });

  it('respects reduceMotion prop', async () => {
    const gasEffect: VisualEffect = {
      effect_type: 'gas_production',
      gas_type: 'nitrogen',
      color: '#0000ff',
      intensity: 0.6,
      duration: 2,
    };

    render(
      <EffectsRenderer
        {...defaultProps}
        effects={[gasEffect]}
        reduceMotion={true}
      />
    );
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('respects prefers-reduced-motion media query', async () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)' ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const gasEffect: VisualEffect = {
      effect_type: 'gas_production',
      gas_type: 'argon',
      color: '#ff00ff',
      intensity: 0.7,
      duration: 2,
    };

    render(<EffectsRenderer {...defaultProps} effects={[gasEffect]} />);
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('uses custom vessel center', async () => {
    const customVesselCenter = { x: 100, y: 150 };
    const gasEffect: VisualEffect = {
      effect_type: 'gas_production',
      gas_type: 'helium',
      color: '#ffff00',
      intensity: 0.4,
      duration: 1,
    };

    render(
      <EffectsRenderer
        {...defaultProps}
        effects={[gasEffect]}
        vesselCenter={customVesselCenter}
      />
    );
    
    await waitFor(() => {
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(
      <EffectsRenderer
        {...defaultProps}
        className="custom-effects-class"
      />
    );
    
    const container = screen.getByRole('img', { hidden: true }).parentElement;
    expect(container).toHaveClass('custom-effects-class');
  });

  it('cleans up animation frames on unmount', () => {
    const { unmount } = render(<EffectsRenderer {...defaultProps} />);
    
    unmount();
    
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles effect duration calculation correctly', async () => {
    const effects: VisualEffect[] = [
      {
        effect_type: 'gas_production',
        gas_type: 'oxygen',
        color: '#00ff00',
        intensity: 0.5,
        duration: 1, // 1 second
      },
      {
        effect_type: 'foam_production',
        color: '#ffffff',
        density: 0.5,
        bubble_size: 'small',
        stability: 2, // 2 seconds
      },
    ];

    const onEffectComplete = vi.fn();
    
    render(
      <EffectsRenderer
        {...defaultProps}
        effects={effects}
        onEffectComplete={onEffectComplete}
      />
    );

    // Fast-forward to complete first effect
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onEffectComplete).toHaveBeenCalledTimes(1);
    });

    // Fast-forward to complete second effect
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onEffectComplete).toHaveBeenCalledTimes(2);
    });
  });
});