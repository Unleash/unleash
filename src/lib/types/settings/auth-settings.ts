interface AuthProvider {
    readonly name: string;
    readonly configId: string;
    readonly deprecatedRemovalTarget?: string;
    readonly default: 'enabled' | 'disabled';
}

export const AUTH_PROVIDERS_CATALOG = {
    Simple: {
        name: 'simple',
        configId: 'unleash.auth.simple',
        default: 'enabled',
    } as AuthProvider,

    OIDC: {
        name: 'oidc',
        configId: 'unleash.enterprise.auth.oidc',
        default: 'disabled',
    } as AuthProvider,

    SAML: {
        name: 'saml',
        configId: 'unleash.enterprise.auth.saml',
        default: 'disabled',
    } as AuthProvider,

    Google: {
        name: 'google',
        configId: 'unleash.enterprise.auth.google',
        deprecatedRemovalTarget: 'v8.0.0',
        default: 'disabled',
    } as AuthProvider,
} as const;

export type AuthProviderConfig =
    (typeof AUTH_PROVIDERS_CATALOG)[keyof typeof AUTH_PROVIDERS_CATALOG];
