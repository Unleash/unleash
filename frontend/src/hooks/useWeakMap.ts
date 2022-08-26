import { useState, useCallback, useRef, useMemo } from 'react';

interface IUseWeakMap<K, V> {
    set: (k: K, v: V) => void;
    get: (k: K) => V | undefined;
}

// A WeakMap associates extra data with an object instance.
// This hook encapsulates a WeakMap, and will trigger
// a rerender whenever `set` is called.
export const useWeakMap = <K extends object, V>(
    initial?: WeakMap<K, V>
): IUseWeakMap<K, V> => {
    const ref = useRef(initial ?? new WeakMap<K, V>());
    const [, setState] = useState(0);

    const set = useCallback((key: K, value: V) => {
        ref.current.set(key, value);
        setState(prev => prev + 1);
    }, []);

    const get = useCallback((key: K) => {
        return ref.current.get(key);
    }, []);

    return useMemo(
        () => ({
            set,
            get,
        }),
        [set, get]
    );
};
