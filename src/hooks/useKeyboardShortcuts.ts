// hooks/useKeyboardShortcuts.ts - FIXED VERSION
import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  ignoreInputs?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts throughout the application
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, ignoreInputs = true } = options;
  const shortcutsRef = useRef<KeyboardShortcut[]>(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // FIX: Add proper null checks for event.target
      const target = event.target;
      if (!target) return;

      // Ignore shortcuts when typing in inputs, textareas, or contenteditable elements
      if (ignoreInputs) {
        // FIX: Safely check if target is an HTMLElement
        if (target instanceof HTMLElement) {
          const tagName = target.tagName?.toLowerCase() || "";
          const isEditable = target.isContentEditable;

          if (tagName === "input" || tagName === "textarea" || isEditable) {
            // Allow Ctrl+S and Ctrl+Z even in inputs
            if (
              !(event.key === "s" && event.ctrlKey) &&
              !(event.key === "z" && event.ctrlKey)
            ) {
              return;
            }
          }
        }
      }

      // Find matching shortcut
      const matchedShortcut = shortcutsRef.current.find((shortcut) => {
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchedShortcut) {
        if (matchedShortcut.preventDefault !== false) {
          event.preventDefault();
        }
        matchedShortcut.handler();
      }
    },
    [enabled, ignoreInputs]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Predefined keyboard shortcuts for common actions
 */
export const commonShortcuts = {
  export: (handler: () => void) => ({
    key: "e",
    handler,
    description: "Export current pattern",
  }),

  copy: (handler: () => void) => ({
    key: "c",
    handler,
    description: "Copy CSS code",
  }),

  copyTailwind: (handler: () => void) => ({
    key: "t",
    handler,
    description: "Copy Tailwind code",
  }),

  favorite: (handler: () => void) => ({
    key: "f",
    handler,
    description: "Toggle favorite",
  }),

  mixer: (handler: () => void) => ({
    key: "m",
    handler,
    description: "Open pattern mixer",
  }),

  save: (handler: () => void) => ({
    key: "s",
    ctrl: true,
    handler,
    description: "Save pattern",
  }),

  undo: (handler: () => void) => ({
    key: "z",
    ctrl: true,
    handler,
    description: "Undo",
  }),

  redo: (handler: () => void) => ({
    key: "y",
    ctrl: true,
    handler,
    description: "Redo",
  }),

  search: (handler: () => void) => ({
    key: "/",
    handler,
    description: "Focus search",
    preventDefault: true,
  }),

  help: (handler: () => void) => ({
    key: "?",
    shift: true,
    handler,
    description: "Show keyboard shortcuts",
    preventDefault: true,
  }),

  escape: (handler: () => void) => ({
    key: "Escape",
    handler,
    description: "Close modal/dialog",
    preventDefault: false,
  }),

  space: (handler: () => void) => ({
    key: " ",
    handler,
    description: "Preview pattern",
    preventDefault: true,
  }),

  arrowLeft: (handler: () => void) => ({
    key: "ArrowLeft",
    handler,
    description: "Previous pattern",
    preventDefault: true,
  }),

  arrowRight: (handler: () => void) => ({
    key: "ArrowRight",
    handler,
    description: "Next pattern",
    preventDefault: true,
  }),

  arrowUp: (handler: () => void) => ({
    key: "ArrowUp",
    handler,
    description: "Previous category",
    preventDefault: true,
  }),

  arrowDown: (handler: () => void) => ({
    key: "ArrowDown",
    handler,
    description: "Next category",
    preventDefault: true,
  }),

  generator: (handler: () => void) => ({
    key: "g",
    handler,
    description: "Open generator",
  }),

  library: (handler: () => void) => ({
    key: "l",
    handler,
    description: "View library",
  }),

  comparison: (handler: () => void) => ({
    key: "c",
    shift: true,
    handler,
    description: "Open comparison view",
  }),

  randomize: (handler: () => void) => ({
    key: "r",
    handler,
    description: "Randomize pattern",
  }),

  duplicate: (handler: () => void) => ({
    key: "d",
    handler,
    description: "Duplicate pattern",
  }),

  increaseOpacity: (handler: () => void) => ({
    key: "ArrowUp",
    ctrl: true,
    handler,
    description: "Increase opacity",
    preventDefault: true,
  }),

  decreaseOpacity: (handler: () => void) => ({
    key: "ArrowDown",
    ctrl: true,
    handler,
    description: "Decrease opacity",
    preventDefault: true,
  }),

  numberKey: (num: number, handler: () => void) => ({
    key: num.toString(),
    handler,
    description: `Switch to category ${num}`,
  }),
};

export default useKeyboardShortcuts;
