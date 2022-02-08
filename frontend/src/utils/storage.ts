// Get an item from localStorage.
// Returns undefined if the browser denies access.
export function getLocalStorageItem<T>(key: string): T | undefined {
    try {
        return parseStoredItem<T>(window.localStorage.getItem(key));
    } catch (err: unknown) {
        console.warn(err);
    }
}

// Store an item in localStorage.
// Does nothing if the browser denies access.
export function setLocalStorageItem(key: string, value: unknown) {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
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
