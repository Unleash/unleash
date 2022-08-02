export function checkForEmptyValues(object?: Object): boolean {
    if (object === undefined) {
        return true;
    }
    return Object.values(object).every(v =>
        v && typeof v === 'object' ? checkForEmptyValues(v) : v === null
    );
}
