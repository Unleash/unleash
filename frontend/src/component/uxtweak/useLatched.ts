import { useState } from 'react';

/** The first truthy value wins and sticks; later changes are ignored. */
export const useLatched = <T>(value: T): T => {
    const [latched, setLatched] = useState(value);
    if (!latched && value) {
        setLatched(value);
    }
    return latched || value;
};
