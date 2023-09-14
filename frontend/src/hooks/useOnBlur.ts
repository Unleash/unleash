import { useEffect } from 'react';

export const useOnBlur = (
    containerRef: React.RefObject<HTMLElement>,
    callback: () => void
): void => {
    useEffect(() => {
        const handleBlur = (event: FocusEvent) => {
            // setTimeout is used because activeElement might not immediately be the new focused element after a blur event
            setTimeout(() => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(document.activeElement)
                ) {
                    callback();
                }
            }, 0);
        };

        const containerElement = containerRef.current;
        if (containerElement) {
            containerElement.addEventListener('blur', handleBlur, true);
        }

        return () => {
            if (containerElement) {
                containerElement.removeEventListener('blur', handleBlur, true);
            }
        };
    }, [containerRef, callback]);
};
