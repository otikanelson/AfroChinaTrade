/**
 * Web-specific toast notification implementation
 * Uses a simple DOM-based toast system
 */

import { ToastManager, ToastOptions } from '../../../shared/src/utils/toast';

interface ToastItem extends ToastOptions {
  id: string;
}

class WebToastManager implements ToastManager {
  private container: HTMLDivElement | null = null;
  private toasts: Map<string, HTMLDivElement> = new Map();

  constructor() {
    this.initContainer();
  }

  private initContainer(): void {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  private getToastStyles(type: ToastOptions['type']): string {
    const baseStyles = `
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 300px;
      max-width: 500px;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      animation: slideIn 0.3s ease-out;
    `;

    const colors = {
      success: 'background: #10b981; color: white;',
      error: 'background: #ef4444; color: white;',
      warning: 'background: #f59e0b; color: white;',
      info: 'background: #3b82f6; color: white;',
    };

    return baseStyles + colors[type];
  }

  show(options: ToastOptions): void {
    if (!this.container) return;

    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast = document.createElement('div');
    toast.id = id;
    toast.style.cssText = this.getToastStyles(options.type);

    const content = document.createElement('div');
    if (options.title) {
      const title = document.createElement('div');
      title.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
      title.textContent = options.title;
      content.appendChild(title);
    }

    const message = document.createElement('div');
    message.textContent = options.message;
    content.appendChild(message);

    toast.appendChild(content);
    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    if (!document.getElementById('toast-animations')) {
      style.id = 'toast-animations';
      document.head.appendChild(style);
    }

    // Auto-dismiss
    const duration = options.duration || 4000;
    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  private dismiss(id: string): void {
    const toast = this.toasts.get(id);
    if (!toast) return;

    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
      this.toasts.delete(id);
    }, 300);
  }

  success(message: string, title?: string): void {
    this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): void {
    this.show({ type: 'error', message, title });
  }

  warning(message: string, title?: string): void {
    this.show({ type: 'warning', message, title });
  }

  info(message: string, title?: string): void {
    this.show({ type: 'info', message, title });
  }
}

// Export singleton instance
export const webToastManager = new WebToastManager();
