export const trim = value => {
    if (value && value.trim) {
        return value.trim();
    } else {
        return value;
    }
};
