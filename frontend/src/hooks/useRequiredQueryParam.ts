export const useRequiredQueryParam = (key: string) => {
    const value = new URLSearchParams(window.location.search).get(key);

    if (!value) {
        throw new Error(`Missing required query param: ${key}`);
    }

    return value;
};
