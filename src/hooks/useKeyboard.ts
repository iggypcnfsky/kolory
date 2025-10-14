'use client';

import { useEffect } from 'react';

export interface KeyboardActions {
  onShuffle: () => void;
  onCopyPalette: () => void;
  onExport: () => void;
  onSave: () => void;
  onHelp?: () => void;
  onNextMode?: () => void;
  onPreviousMode?: () => void;
}

export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          // Always prevent default for spacebar and trigger shuffle
          e.preventDefault();
          e.stopPropagation();
          actions.onShuffle();
          // Blur any focused element to prevent it from capturing future events
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          actions.onNextMode?.();
          // Blur any focused element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
        case 'arrowup':
          e.preventDefault();
          actions.onPreviousMode?.();
          // Blur any focused element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          break;
        case 'c':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            actions.onCopyPalette();
          }
          break;
        case 'e':
          e.preventDefault();
          actions.onExport();
          break;
        case 's':
          e.preventDefault();
          actions.onSave();
          break;
        case '?':
          e.preventDefault();
          actions.onHelp?.();
          break;
      }
    };

    // Use capture phase to intercept events before they reach focused elements
    window.addEventListener('keydown', handleKeyPress, true);
    return () => window.removeEventListener('keydown', handleKeyPress, true);
  }, [actions]);
}

