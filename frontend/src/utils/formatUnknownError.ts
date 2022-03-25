// Get a human-readable error message string from a caught value.
export const formatUnknownError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message || error.toString();
    } else if (typeof error === 'string') {
        return error;
    } else {
        return 'Unknown error';
    }
};
