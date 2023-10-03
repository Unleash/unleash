import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Store a value in the query string. Call setState to update the query string.
export const useQueryStringState = (
    key: string
): [string | undefined, (value: string) => void] => {
    const { search } = window.location;
    const navigate = useNavigate();

    const params = useMemo(() => {
        return new URLSearchParams(search);
    }, [search]);

    const setState = useCallback(
        (value: string) => {
            const next = new URLSearchParams(search);
            next.set(key, value);
            navigate({ search: next.toString() }, { replace: true });
        },
        [key, search, navigate]
    );

    return [params.get(key) || undefined, setState];
};
