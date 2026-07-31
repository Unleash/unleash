const SELECTOR_PATTERN = '[A-Za-z0-9_-]{22}';
const TOKEN_PATTERN = new RegExp(
    `\\.v2_(${SELECTOR_PATTERN})_([A-Za-z0-9_-]{43})$`,
);
const SELECTOR_ID_PATTERN = new RegExp(`^${SELECTOR_PATTERN}$`);

export const parseApiTokenV2 = (
    token: string,
): { selector: string } | undefined => {
    const match = TOKEN_PATTERN.exec(token);
    return match ? { selector: match[1] } : undefined;
};

export const isApiTokenV2 = (token: string | undefined): token is string => {
    return Boolean(token && TOKEN_PATTERN.test(token));
};

export const isApiTokenV2OrSelector = (
    token: string | undefined,
): token is string => {
    // Admin routes can address v2 tokens by the full credential or by the
    // selector returned as the management identifier after creation.
    return Boolean(
        token && (isApiTokenV2(token) || SELECTOR_ID_PATTERN.test(token)),
    );
};
