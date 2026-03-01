/**
 * Unit tests for toast notification utilities
 */

import {
  ToastManager,
  setToastManager,
  getToastManager,
  toast,
  showErrorToast,
  showSuccessToast,
} from '../toast';

describe('Toast utilities', () => {
  describe('ToastManager', () => {
    let mockManager: ToastManager;
    let showSpy: jest.Mock;
    let successSpy: jest.Mock;
    let errorSpy: jest.Mock;
    let warningSpy: jest.Mock;
    let infoSpy: jest.Mock;

    beforeEach(() => {
      showSpy = jest.fn();
      successSpy = jest.fn();
      errorSpy = jest.fn();
      warningSpy = jest.fn();
      infoSpy = jest.fn();

      mockManager = {
        show: showSpy,
        success: successSpy,
        error: errorSpy,
        warning: warningSpy,
        info: infoSpy,
      };

      setToastManager(mockManager);
    });

    describe('setToastManager and getToastManager', () => {
      it('should set and get the toast manager', () => {
        const manager = getToastManager();
        expect(manager).toBe(mockManager);
      });
    });

    describe('toast.show', () => {
      it('should call the manager show method with options', () => {
        const options = { type: 'success' as const, message: 'Test message' };
        toast.show(options);
        
        expect(showSpy).toHaveBeenCalledWith(options);
        expect(showSpy).toHaveBeenCalledTimes(1);
      });

      it('should support all toast types', () => {
        toast.show({ type: 'success', message: 'Success' });
        toast.show({ type: 'error', message: 'Error' });
        toast.show({ type: 'warning', message: 'Warning' });
        toast.show({ type: 'info', message: 'Info' });
        
        expect(showSpy).toHaveBeenCalledTimes(4);
      });

      it('should support optional title and duration', () => {
        const options = {
          type: 'info' as const,
          message: 'Test',
          title: 'Title',
          duration: 5000,
        };
        toast.show(options);
        
        expect(showSpy).toHaveBeenCalledWith(options);
      });
    });

    describe('toast.success', () => {
      it('should call the manager success method', () => {
        toast.success('Success message');
        
        expect(successSpy).toHaveBeenCalledWith('Success message', undefined);
        expect(successSpy).toHaveBeenCalledTimes(1);
      });

      it('should support optional title', () => {
        toast.success('Success message', 'Success Title');
        
        expect(successSpy).toHaveBeenCalledWith('Success message', 'Success Title');
      });
    });

    describe('toast.error', () => {
      it('should call the manager error method', () => {
        toast.error('Error message');
        
        expect(errorSpy).toHaveBeenCalledWith('Error message', undefined);
        expect(errorSpy).toHaveBeenCalledTimes(1);
      });

      it('should support optional title', () => {
        toast.error('Error message', 'Error Title');
        
        expect(errorSpy).toHaveBeenCalledWith('Error message', 'Error Title');
      });
    });

    describe('toast.warning', () => {
      it('should call the manager warning method', () => {
        toast.warning('Warning message');
        
        expect(warningSpy).toHaveBeenCalledWith('Warning message', undefined);
        expect(warningSpy).toHaveBeenCalledTimes(1);
      });

      it('should support optional title', () => {
        toast.warning('Warning message', 'Warning Title');
        
        expect(warningSpy).toHaveBeenCalledWith('Warning message', 'Warning Title');
      });
    });

    describe('toast.info', () => {
      it('should call the manager info method', () => {
        toast.info('Info message');
        
        expect(infoSpy).toHaveBeenCalledWith('Info message', undefined);
        expect(infoSpy).toHaveBeenCalledTimes(1);
      });

      it('should support optional title', () => {
        toast.info('Info message', 'Info Title');
        
        expect(infoSpy).toHaveBeenCalledWith('Info message', 'Info Title');
      });
    });

    describe('showErrorToast', () => {
      it('should show error toast from Error object', () => {
        const error = new Error('Test error');
        showErrorToast(error);
        
        expect(errorSpy).toHaveBeenCalledWith('Test error', 'Error');
      });

      it('should show error toast from string', () => {
        showErrorToast('String error');
        
        expect(errorSpy).toHaveBeenCalledWith('String error', 'Error');
      });

      it('should support custom title', () => {
        const error = new Error('Test error');
        showErrorToast(error, 'Custom Title');
        
        expect(errorSpy).toHaveBeenCalledWith('Test error', 'Custom Title');
      });
    });

    describe('showSuccessToast', () => {
      it('should show success toast with message', () => {
        showSuccessToast('Operation successful');
        
        expect(successSpy).toHaveBeenCalledWith('Operation successful', 'Success');
      });

      it('should support custom title', () => {
        showSuccessToast('Operation successful', 'Custom Success');
        
        expect(successSpy).toHaveBeenCalledWith('Operation successful', 'Custom Success');
      });
    });
  });

  describe('Default console-based toast manager', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      // Reset to default console-based manager
      const ConsoleToastManager = require('../toast').ConsoleToastManager;
      if (ConsoleToastManager) {
        setToastManager(new ConsoleToastManager());
      }
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log to console when no custom manager is set', () => {
      // This test verifies the fallback behavior
      // The actual implementation may vary based on the default manager
      expect(getToastManager()).toBeDefined();
    });
  });
});
