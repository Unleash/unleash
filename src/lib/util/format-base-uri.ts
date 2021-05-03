export const formatBaseUri = (input: string): string => {
    if (!input) return '';
    const firstChar = input[0];
    const lastChar = input[input.length - 1];

    if (firstChar === '/' && lastChar === '/') {
        return input.substr(0, input.length - 1);
    }

    if (firstChar !== '/' && lastChar === '/') {
        return `/${input.substr(0, input.length - 1)}`;
    }

    if (firstChar !== '/') {
        return `/${input}`;
    }

    return input;
};
