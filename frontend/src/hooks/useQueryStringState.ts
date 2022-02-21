import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

// Store a value in the query string. Call setState to update the query string.
export const useQueryStringState = (
    key: string
): [string | undefined, (value: string) => void] => {
    const { search } = window.location;
    const { replace } = useHistory();

    const params = useMemo(() => {
        return new URLSearchParams(search);
    }, [search]);

    const setState = useCallback(
        (value: string) => {
            const next = new URLSearchParams(search);
            next.set(key, value);
            replace({ search: next.toString() });
        },
        [key, search, replace]
    );

    return [params.get(key) || undefined, setState];
};
