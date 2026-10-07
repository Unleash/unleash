import type { RefObject } from 'react';
import { useKeyboardShortcut } from './useKeyboardShortcut.js';

export const useKeyboardCopy = (
    handler: () => void,
    anchorRefs?: Array<RefObject<Element | null>>,
) =>
    useKeyboardShortcut(
        {
            key: 'c',
            modifiers: ['ctrl'],
            preventDefault: false,
            anchorRefs,
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
