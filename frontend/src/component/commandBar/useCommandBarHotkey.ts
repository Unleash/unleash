import type { RefObject } from 'react';
import {
    useKeyboardShortcut,
    useKeyboardShortcutLabel,
} from 'hooks/useKeyboardShortcut';

const KEY = 'k';
const MODIFIERS: Array<'ctrl'> = ['ctrl'];

export const useCommandBarHotkey = (
    anchorRefs: Array<RefObject<Element | null>>,
    onPress: () => void,
) => {
    useKeyboardShortcut(
        { key: KEY, modifiers: MODIFIERS, preventDefault: true, anchorRefs },
        onPress,
    );
};

export const useCommandBarHotkeyLabel = () =>
    useKeyboardShortcutLabel(KEY, MODIFIERS);

export const useCommandBarPlaceholder = () =>
    `Command menu (${useCommandBarHotkeyLabel()})`;
