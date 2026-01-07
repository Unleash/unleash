type Expirable<T> = {
    value: T | undefined;
    expiry: number | null;
};

function isFunction(value: any): boolean {
    return typeof value === 'function';
}

function serializer(_key: string, value: any): any {
    if (isFunction(value)) {
        console.warn('Unable to store function.');
        return undefined;
    }
    if (value instanceof Map) {
        return { dataType: 'Map', value: Array.from(value.entries()) };
    } else if (value instanceof Set) {
        return { dataType: 'Set', value: Array.from(value) };
    }
    return value;
}

function deserializer(_key: string, value: any): any {
    if (value && value.dataType === 'Map') {
        return new Map(value.value);
    } else if (value && value.dataType === 'Set') {
        return new Set(value.value);
    }
    return value;
}

// Custom replacer for JSON.stringify to handle complex objects
function customReplacer(key: string, value: any): any {
    return serializer(key, value);
}

// Get an item from localStorage.
// Returns undefined if the browser denies access.
export function getLocalStorageItem<T>(key: string): T | undefined {
    try {
        const itemStr = window.localStorage.getItem(key);
        if (!itemStr) {
            return undefined;
        }

        const item: Expirable<T> | undefined = parseStoredItem(itemStr);
        if (item?.expiry && Date.now() > item.expiry) {
            window.localStorage.removeItem(key);
            return undefined;
        }
        return item?.value;
    } catch (err: unknown) {
        console.warn(err);
        return undefined;
    }
}

// Store an item in localStorage.
// Does nothing if the browser denies access.
export function setLocalStorageItem<T>(
    key: string,
    value: T | undefined = undefined,
    timeToLive?: number, // milliseconds
) {
    try {
        const item: Expirable<T> = {
            value,
            expiry: timeToLive !== undefined ? Date.now() + timeToLive : null,
        };
        window.localStorage.setItem(key, JSON.stringify(item, customReplacer));
    } catch (err: unknown) {
        console.warn(err);
    }
}

// Store an item in sessionStorage with optional TTL
export function setSessionStorageItem<T>(
    key: string,
    value: T | undefined = undefined,
    timeToLive?: number, // milliseconds
) {
    try {
        const item: Expirable<T> = {
            value,
            expiry: timeToLive !== undefined ? Date.now() + timeToLive : null,
        };
        window.sessionStorage.setItem(
            key,
            JSON.stringify(item, customReplacer),
        );
    } catch (err: unknown) {
        console.warn(err);
    }
}

// Get an item from sessionStorage, checking for TTL
export function getSessionStorageItem<T>(key: string): T | undefined {
    try {
        const itemStr = window.sessionStorage.getItem(key);
        if (!itemStr) {
            return undefined;
        }

        const item: Expirable<T> | undefined = parseStoredItem(itemStr);
        if (item?.expiry && Date.now() > item.expiry) {
            window.sessionStorage.removeItem(key);
            return undefined;
        }
        return item?.value;
    } catch (err: unknown) {
        console.warn(err);
        return undefined;
    }
}

// Parse an item from localStorage.
// Returns undefined if the item could not be parsed.
function parseStoredItem<T>(data: string | null): Expirable<T> | undefined {
    try {
        const item: Expirable<T> = data
            ? JSON.parse(data, deserializer)
            : undefined;
        return item;
    } catch (err: unknown) {
        console.warn(err);
        return undefined;
    }
}
