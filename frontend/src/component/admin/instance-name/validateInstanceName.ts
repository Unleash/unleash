export const NAME_MAX_LENGTH = 100;
export const NAME_ALLOWED_PATTERN = /^[\p{L}\p{N} ./()_-]+$/u;

export const validateInstanceName = (name: string): string | undefined => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    if (trimmed.length > NAME_MAX_LENGTH) {
        return `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
    }
    if (!NAME_ALLOWED_PATTERN.test(trimmed)) {
        return 'Name can only contain letters, numbers, spaces, and . / ( ) _ -';
    }
    return undefined;
};
