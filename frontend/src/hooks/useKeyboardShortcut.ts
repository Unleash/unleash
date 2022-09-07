import { useEffect, useMemo } from 'react';
import { useIsAppleDevice } from './useIsAppleDevice';

export const useKeyboardShortcut = (
    {
        key,
        modifiers = [],
        preventDefault = false,
    }: {
        key: string;
        modifiers?: Array<'ctrl' | 'alt' | 'shift'>;
        preventDefault?: boolean;
    },
    callback: () => void
) => {
    const isAppleDevice = useIsAppleDevice();
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (key !== event.key) {
                return;
            }
            if (modifiers.includes('ctrl')) {
                if (isAppleDevice) {
                    if (!event.metaKey) {
                        return;
                    }
                } else {
                    if (!event.ctrlKey) {
                        return;
                    }
                }
            }
            if (modifiers.includes('alt') && !event.altKey) {
                return;
            }
            if (modifiers.includes('shift') && !event.shiftKey) {
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
    }, [isAppleDevice, key, modifiers, preventDefault, callback]);

    const formattedModifiers = useMemo(
        () =>
            modifiers.map(
                modifier =>
                    ({
                        ctrl: isAppleDevice ? '⌘' : 'Ctrl',
                        alt: 'Alt',
                        shift: 'Shift',
                    }[modifier])
            ),
        [isAppleDevice, modifiers]
    );

    const hotkeyDescription = useMemo(
        () =>
            [
                ...formattedModifiers,
                `${key[0].toUpperCase()}${key.slice(1)}`,
            ].join('+'),
        [formattedModifiers, key]
    );

    return hotkeyDescription;
};
