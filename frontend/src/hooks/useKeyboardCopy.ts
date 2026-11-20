import type { RefObject } from 'react';
import {
    type Modifier,
    useKeyboardShortcut,
    useKeyboardShortcutLabel,
} from './useKeyboardShortcut.js';

const KEY = 'c';
const MODIFIERS: Modifier[] = ['ctrl'];

export const useKeyboardCopy = (
    handler: () => void,
    anchorRefs?: Array<RefObject<Element | null>>,
) => {
    useKeyboardShortcut(
        {
            key: KEY,
            modifiers: MODIFIERS,
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
    return useKeyboardShortcutLabel(KEY, MODIFIERS);
};
