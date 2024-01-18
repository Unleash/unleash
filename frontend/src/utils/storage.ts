// Get an item from localStorage.
// Returns undefined if the browser denies access.
export function getLocalStorageItem<T>(key: string): T | undefined {
    try {
        const itemStr = window.localStorage.getItem(key);
        if (!itemStr) {
            return undefined;
        }

        const item = JSON.parse(itemStr);
        if (item.expiry && new Date().getTime() > item.expiry) {
            window.localStorage.removeItem(key);
            return undefined;
        }
        return item.value as T;
    } catch (err: unknown) {
        console.warn(err);
        return undefined;
    }
}

// Store an item in localStorage.
// Does nothing if the browser denies access.
export function setLocalStorageItem(
    key: string,
    value: unknown,
    timeToLive?: number,
) {
    try {
        const item = {
            value,
            expiry:
                timeToLive !== undefined
                    ? new Date().getTime() + timeToLive
                    : null,
        };
        window.localStorage.setItem(
            key,
            JSON.stringify(item, (_key, value) =>
                value instanceof Set ? [...value] : value,
            ),
        );
    } catch (err: unknown) {
        console.warn(err);
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
