import { createLocalStorage } from 'utils/createLocalStorage';
import { useEffect, useMemo, useState } from 'react';

// if you provided persistent id the query will be persisted in local storage
export const useSavedQuery = (id?: string) => {
    const { value, setValue } = useMemo(
        () =>
            createLocalStorage(`Search:${id || 'default'}:v1`, {
                query: '',
            }),
        [id],
    );
    const [savedQuery, setSavedQuery] = useState(value.query);

    useEffect(() => {
        if (id && savedQuery.trim().length > 0) {
            setValue({ query: savedQuery });
        }
    }, [id, savedQuery, setValue]);

    return {
        savedQuery,
        setSavedQuery: (newValue: string) => {
            if (newValue.trim().length > 0) {
                setSavedQuery(newValue);
            }
        },
    };
};
