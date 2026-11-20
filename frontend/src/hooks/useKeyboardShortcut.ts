import { type RefObject, useEffect } from 'react';
import { useIsAppleDevice } from './useIsAppleDevice.js';
import { isHiddenByVisibleDialog } from 'utils/isHiddenByVisibleDialog.js';

export type Modifier = 'ctrl' | 'alt' | 'shift';

export const useKeyboardShortcut = (
    {
        key,
        modifiers = [],
        preventDefault = false,
        anchorRefs,
    }: {
        key: string;
        modifiers?: Modifier[];
        preventDefault?: boolean;
        anchorRefs?: Array<RefObject<Element | null>>;
    },
    callback: () => void,
) => {
    const isAppleDevice = useIsAppleDevice();
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (key.toLowerCase() !== event.key.toLowerCase()) {
                return;
            }
            if (
                anchorRefs?.every((ref) => isHiddenByVisibleDialog(ref.current))
            ) {
                return;
            }

            const ctrlOrMetaKey = isAppleDevice ? event.metaKey : event.ctrlKey;
            if (modifiers.includes('ctrl') !== ctrlOrMetaKey) {
                return;
            }
            if (modifiers.includes('alt') !== event.altKey) {
                return;
            }
            if (modifiers.includes('shift') !== event.shiftKey) {
                return;
            }

            if (preventDefault) {
                event.preventDefault();
            }

            callback();
        };

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isAppleDevice, key, modifiers, preventDefault, anchorRefs, callback]);
};

export const useKeyboardShortcutLabel = (
    key: string,
    modifiers: Modifier[],
) => {
    const isAppleDevice = useIsAppleDevice();
    return formatShortcutLabel(key, modifiers, isAppleDevice);
};

const formatShortcutLabel = (
    key: string,
    modifiers: Modifier[],
    isAppleDevice: boolean | undefined,
) =>
    [
        ...modifiers.map(
            (modifier) =>
                ({
                    ctrl: isAppleDevice ? '⌘' : 'Ctrl',
                    alt: 'Alt',
                    shift: 'Shift',
                })[modifier],
        ),
        `${key[0].toUpperCase()}${key.slice(1)}`,
    ].join('+');
