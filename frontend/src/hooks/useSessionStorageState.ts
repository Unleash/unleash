import { useEffect, useState } from 'react';
import { basePath } from 'utils/formatPath';
import { getSessionStorageItem, setSessionStorageItem } from 'utils/storage';

export const useSessionStorageState = <T>(key: string, initialValue: T) => {
    const internalKey = `${basePath}:${key}:sessionStorage`;
    const [value, setValue] = useState<T>(
        () => getSessionStorageItem<T>(internalKey) ?? initialValue,
    );

    useEffect(() => {
        setSessionStorageItem(internalKey, value);
    }, [internalKey, value]);

    return [value, setValue] as const;
};
