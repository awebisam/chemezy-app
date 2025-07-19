import { vi } from 'vitest';
import { 
  getFocusableElements, 
  trapFocus, 
  createFocusRestorer,
  announceToScreenReader,
  prefersReducedMotion,
  keyboardNavigation,
  liveRegionManager
} from '../focus';

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    visibility: 'visible'
  })
});

describe('Focus Management Utilities', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('getFocusableElements', () => {
    it('should find focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <input type="text" />
        <a href="#">Link</a>
        <button disabled>Disabled Button</button>
        <div tabindex="0">Focusable Div</div>
        <div tabindex="-1">Non-focusable Div</div>
      `;
      document.body.appendChild(container);

      const focusableElements = getFocusableElements(container);
      
      expect(focusableElements).toHaveLength(4); // button, input, link, focusable div
      expect(focusableElements[0].tagName).toBe('BUTTON');
      expect(focusableElements[1].tagName).toBe('INPUT');
      expect(focusableElements[2].tagName).toBe('A');
      expect(focusableElements[3].getAttribute('tabindex')).toBe('0');
    });

    it('should exclude hidden elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Visible Button</button>
        <button style="display: none;">Hidden Button</button>
        <button hidden>Hidden Button 2</button>
      `;
      document.body.appendChild(container);

      const focusableElements = getFocusableElements(container);
      
      expect(focusableElements).toHaveLength(1);
      expect(focusableElements[0].textContent).toBe('Visible Button');
    });
  });

  describe('trapFocus', () => {
    it('should trap focus within container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      
      // Should focus first element
      expect(document.activeElement?.id).toBe('first');
      
      cleanup();
    });

    it('should return cleanup function', () => {
      const container = document.createElement('div');
      container.innerHTML = '<button>Test</button>';
      document.body.appendChild(container);

      const cleanup = trapFocus(container);
      
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('createFocusRestorer', () => {
    it('should save and restore focus', () => {
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      button1.id = 'button1';
      button2.id = 'button2';
      
      document.body.appendChild(button1);
      document.body.appendChild(button2);
      
      button1.focus();
      expect(document.activeElement).toBe(button1);
      
      const focusRestorer = createFocusRestorer();
      focusRestorer.save();
      
      button2.focus();
      expect(document.activeElement).toBe(button2);
      
      focusRestorer.restore();
      expect(document.activeElement).toBe(button1);
    });
  });

  describe('announceToScreenReader', () => {
    it('should create and remove announcement element', () => {
      announceToScreenReader('Test announcement');
      
      const announcement = document.querySelector('[aria-live]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test announcement');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
      
      // Should be removed after timeout (we'll check it exists for now)
      expect(announcement).toBeInTheDocument();
    });

    it('should support assertive priority', () => {
      announceToScreenReader('Urgent message', 'assertive');
      
      const announcement = document.querySelector('[aria-live="assertive"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Urgent message');
    });
  });

  describe('prefersReducedMotion', () => {
    it('should check for reduced motion preference', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
        })),
      });

      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });
  });

  describe('keyboardNavigation', () => {
    describe('handleArrowKeys', () => {
      it('should handle arrow down navigation', () => {
        const items = [
          document.createElement('button'),
          document.createElement('button'),
          document.createElement('button'),
        ];
        
        const onIndexChange = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        
        keyboardNavigation.handleArrowKeys(event, items, 0, onIndexChange);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(onIndexChange).toHaveBeenCalledWith(1);
      });

      it('should handle arrow up navigation', () => {
        const items = [
          document.createElement('button'),
          document.createElement('button'),
          document.createElement('button'),
        ];
        
        const onIndexChange = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        
        keyboardNavigation.handleArrowKeys(event, items, 1, onIndexChange);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(onIndexChange).toHaveBeenCalledWith(0);
      });

      it('should wrap around at boundaries', () => {
        const items = [
          document.createElement('button'),
          document.createElement('button'),
        ];
        
        const onIndexChange = vi.fn();
        
        // Test wrapping from last to first
        const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        keyboardNavigation.handleArrowKeys(downEvent, items, 1, onIndexChange);
        expect(onIndexChange).toHaveBeenCalledWith(0);
        
        // Test wrapping from first to last
        const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        keyboardNavigation.handleArrowKeys(upEvent, items, 0, onIndexChange);
        expect(onIndexChange).toHaveBeenCalledWith(1);
      });
    });

    describe('handleActivation', () => {
      it('should handle Enter key activation', () => {
        const callback = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        
        keyboardNavigation.handleActivation(event, callback);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();
      });

      it('should handle Space key activation', () => {
        const callback = vi.fn();
        const event = new KeyboardEvent('keydown', { key: ' ' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        
        keyboardNavigation.handleActivation(event, callback);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(callback).toHaveBeenCalled();
      });

      it('should ignore other keys', () => {
        const callback = vi.fn();
        const event = new KeyboardEvent('keydown', { key: 'a' });
        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        
        keyboardNavigation.handleActivation(event, callback);
        
        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('liveRegionManager', () => {
    afterEach(() => {
      // Clean up any created regions
      document.querySelectorAll('[id^="live-region-"]').forEach(el => el.remove());
    });

    it('should create and manage live regions', () => {
      const region = liveRegionManager.getRegion('test', 'polite');
      
      expect(region).toBeTruthy();
      expect(region.getAttribute('aria-live')).toBe('polite');
      expect(region.getAttribute('aria-atomic')).toBe('true');
      expect(region.id).toBe('live-region-test');
    });

    it('should reuse existing regions', () => {
      const region1 = liveRegionManager.getRegion('test', 'polite');
      const region2 = liveRegionManager.getRegion('test', 'assertive');
      
      expect(region1).toBe(region2);
    });

    it('should announce messages', () => {
      liveRegionManager.announce('test', 'Test message');
      
      const region = document.getElementById('live-region-test');
      expect(region?.textContent).toBe('Test message');
    });

    it('should clear regions', () => {
      liveRegionManager.announce('test', 'Test message');
      liveRegionManager.clear('test');
      
      const region = document.getElementById('live-region-test');
      expect(region?.textContent).toBe('');
    });

    it('should remove regions', () => {
      liveRegionManager.getRegion('test');
      expect(document.getElementById('live-region-test')).toBeTruthy();
      
      liveRegionManager.remove('test');
      expect(document.getElementById('live-region-test')).toBeFalsy();
    });
  });
});