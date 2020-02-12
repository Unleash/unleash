export const trim = value => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};

export function loadNameFromHash() {
    let field = '';
    try {
        [, field] = document.location.hash.match(/name=([a-z0-9-_.]+)/i);
    } catch (e) {
        // nothing
    }
    return field;
}
