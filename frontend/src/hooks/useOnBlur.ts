import { useEffect } from 'react';

export const useOnBlur = (
    containerRef: React.RefObject<HTMLElement>,
    callback: () => void,
): void => {
    useEffect(() => {
        let mouseDownInside = false;

        const handleMouseDown = (event: MouseEvent) => {
            mouseDownInside =
                containerRef.current?.contains(event.target as Node) || false;
        };

        const handleBlur = (_event: FocusEvent) => {
            setTimeout(() => {
                if (
                    !mouseDownInside &&
                    containerRef.current &&
                    !containerRef.current.contains(document.activeElement)
                ) {
                    callback();
                }
                // Reset the flag for the next sequence of events.
                mouseDownInside = false;
            }, 0);
        };

        document.addEventListener('mousedown', handleMouseDown);

        const containerElement = containerRef.current;
        if (containerElement) {
            containerElement.addEventListener('blur', handleBlur, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            if (containerElement) {
                containerElement.removeEventListener('blur', handleBlur, true);
            }
        };
    }, [containerRef, callback]);
};
