export const ACCESS_DENIED_TEXT = 'Access denied';

export const formatAccessText = (
    hasAccess: boolean,
    hasAccessText?: string
): string | undefined => {
    if (hasAccess) {
        return hasAccessText;
    }

    if (hasAccessText) {
        return `${hasAccessText} (${ACCESS_DENIED_TEXT})`;
    }

    return ACCESS_DENIED_TEXT;
};
