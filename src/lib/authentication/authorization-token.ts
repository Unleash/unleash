const SELECTOR_PATTERN = '[A-Za-z0-9_-]{22}';
const TOKEN_PATTERN = new RegExp(
    `\\.v2_(${SELECTOR_PATTERN})_([A-Za-z0-9_-]{43})$`,
);
const SELECTOR_ID_PATTERN = new RegExp(`^${SELECTOR_PATTERN}$`);

/**
 * Credential families that can be determined from an authorization value.
 * Permissions and project scope are resolved separately from storage.
 */
export enum AuthorizationTokenKind {
    USER_ACCESS = 'user-access', // either a user or a service account
    API_TOKEN = 'api-token', // either a v1 or v2 API token
    ADMIN_API_TOKEN = 'admin-api-token', // this is deprecated but still supported
}

type ApiTokenKind =
    | AuthorizationTokenKind.API_TOKEN
    | AuthorizationTokenKind.ADMIN_API_TOKEN;

/**
 * A full V2 API-token credential, used for authentication.
 * The selector is derived from the secret and is stored in the database for lookup.
 * The secret is never stored in the database.
 */
export type ApiTokenV2Credential = {
    kind: ApiTokenKind;
    version: 'v2';
    secret: string;
    selector: string;
};

/**
 * A selector-only V2 API-token reference, used by admin management APIs.
 * It identifies a token but cannot authenticate a request.
 */
export type ApiTokenV2Identifier = {
    kind: ApiTokenKind;
    version: 'v2';
    selector: string;
};

/** A V1 API-token credential; identified from its secret which is stored in the db. */
export type LegacyApiToken = {
    kind: ApiTokenKind;
    version: 'v1';
    secret: string;
};

/** API credentials, regardless of their credential version. */
export type ApiTokenCredential = LegacyApiToken | ApiTokenV2Credential;

/** A V1 user credential for a person or service account. */
export type UserAccessCredential = {
    kind: AuthorizationTokenKind.USER_ACCESS;
    version: 'v1';
    secret: string;
};

/** A credential parsed from an Authorization header. */
export type AuthorizationCredential = UserAccessCredential | ApiTokenCredential;

const parseApiTokenV2Credential = (
    secret: string,
): ApiTokenV2Credential | undefined => {
    const match = TOKEN_PATTERN.exec(secret);
    return match
        ? {
              kind: getApiTokenKind(secret),
              version: 'v2',
              secret,
              selector: match[1],
          }
        : undefined;
};

export const parseApiToken = (
    secret: string | undefined,
): ApiTokenCredential | undefined => {
    if (!secret) {
        return undefined;
    }

    return (
        parseApiTokenV2Credential(secret) || {
            kind: getApiTokenKind(secret),
            version: 'v1',
            secret,
        }
    );
};

export const parseAuthorizationToken = (
    secret: string | undefined,
): AuthorizationCredential | undefined => {
    if (!secret) {
        return undefined;
    }

    if (secret.startsWith('user:')) {
        return {
            kind: AuthorizationTokenKind.USER_ACCESS,
            version: 'v1',
            secret,
        };
    }

    return parseApiToken(secret);
};

export const parseApiTokenV2Identifier = (
    token: string,
): ApiTokenV2Identifier | undefined => {
    const credential = parseApiTokenV2Credential(token);
    if (credential) {
        return {
            kind: credential.kind,
            version: 'v2',
            selector: credential.selector,
        };
    }

    // Admin routes can address v2 tokens by the full credential or by the
    // identifier returned as the management identifier after creation.
    return SELECTOR_ID_PATTERN.test(token)
        ? {
              kind: AuthorizationTokenKind.API_TOKEN,
              version: 'v2',
              selector: token,
          }
        : undefined;
};

const getApiTokenKind = (secret: string): ApiTokenKind =>
    secret.startsWith('*:*')
        ? AuthorizationTokenKind.ADMIN_API_TOKEN
        : AuthorizationTokenKind.API_TOKEN;
