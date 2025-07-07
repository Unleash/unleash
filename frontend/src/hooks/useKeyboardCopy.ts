import { useKeyboardShortcut } from './useKeyboardShortcut.js';

export const useKeyboardCopy = (handler: () => void) =>
    useKeyboardShortcut(
        {
            key: 'c',
            modifiers: ['ctrl'],
            preventDefault: false,
        },
        () => {
            const selection = window.getSelection?.();
            if (
                selection &&
                (selection.type === 'None' || selection.type === 'Caret')
            ) {
                handler();
            }
        },
    );
