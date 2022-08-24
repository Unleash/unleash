import { useRef, useEffect } from 'react';

// Call `onVisible` when the `ref` element is fully visible in the viewport.
// Useful for detecting when the user has scrolled to the bottom of the page.
export const useOnVisible = <T extends HTMLElement>(onVisible: () => void) => {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            const handler = (entries: IntersectionObserverEntry[]) => {
                if (entries[0].isIntersecting) {
                    onVisible();
                }
            };

            const observer = new IntersectionObserver(handler);
            observer.observe(ref.current);

            return () => observer.disconnect();
        }
    }, [onVisible]);

    return ref;
};
