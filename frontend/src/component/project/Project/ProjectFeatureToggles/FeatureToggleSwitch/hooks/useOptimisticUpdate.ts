import { useCallback, useEffect, useState } from 'react';

export const useOptimisticUpdate = <T>(state: T) => {
    const [value, setValue] = useState(state);

    const rollback = useCallback(() => setValue(state), [state]);

    useEffect(() => {
        setValue(state);
    }, [state]);

    return [value, setValue, rollback] as const;
};
