import { type RefObject, useEffect, useMemo } from 'react';
import { useIsAppleDevice } from './useIsAppleDevice.js';
import { isHiddenByVisibleDialog } from 'utils/isHiddenByVisibleDialog.js';

export const useKeyboardShortcut = (
    {
        key,
        modifiers = [],
        preventDefault = false,
        anchorRefs,
    }: {
        key: string;
        modifiers?: Array<'ctrl' | 'alt' | 'shift'>;
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

    const formattedModifiers = useMemo(
        () =>
            modifiers.map(
                (modifier) =>
                    ({
                        ctrl: isAppleDevice ? '⌘' : 'Ctrl',
                        alt: 'Alt',
                        shift: 'Shift',
                    })[modifier],
            ),
        [isAppleDevice, modifiers],
    );

    return useMemo(
        () =>
            [
                ...formattedModifiers,
                `${key[0].toUpperCase()}${key.slice(1)}`,
            ].join('+'),
        [formattedModifiers, key],
    );
};
