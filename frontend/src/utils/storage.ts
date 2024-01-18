type Expirable<T> = {
    value: T | undefined;
    expiry: number | null;
};

// Get an item from localStorage.
// Returns undefined if the browser denies access.
export function getLocalStorageItem<T>(key: string): T | undefined {
    try {
        const itemStr = window.localStorage.getItem(key);
        if (!itemStr) {
            return undefined;
        }

        const item: Expirable<T> | undefined = parseStoredItem(itemStr);
        if (item?.expiry && new Date().getTime() > item.expiry) {
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
    timeToLive?: number,
) {
    try {
        const item: Expirable<T> = {
            value,
            expiry:
                timeToLive !== undefined
                    ? new Date().getTime() + timeToLive
                    : null,
        };
        window.localStorage.setItem(key, JSON.stringify(item));
    } catch (err: unknown) {
        console.warn(err);
    }
}

// Store an item in sessionStorage with optional TTL
export function setSessionStorageItem<T>(
    key: string,
    value: T | undefined = undefined,
    timeToLive?: number,
) {
    try {
        const item: Expirable<T> = {
            value,
            expiry:
                timeToLive !== undefined
                    ? new Date().getTime() + timeToLive
                    : null,
        };
        window.sessionStorage.setItem(key, JSON.stringify(item));
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
        if (item?.expiry && new Date().getTime() > item.expiry) {
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
function parseStoredItem<T>(data: string | null): T | undefined {
    try {
        return data ? JSON.parse(data) : undefined;
    } catch (err: unknown) {
        console.warn(err);
    }
}
