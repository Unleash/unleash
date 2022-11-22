import { useEffect, useState } from 'react';

export const useLastViewedProject = () => {
    const [lastViewed, setLastViewed] = useState(() => {
        return localStorage.getItem('lastViewedProject');
    });

    useEffect(() => {
        if (lastViewed) {
            localStorage.setItem('lastViewedProject', lastViewed);
        }
    }, [lastViewed]);

    return {
        lastViewed,
        setLastViewed,
    };
};
