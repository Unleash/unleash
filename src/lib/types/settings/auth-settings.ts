interface AuthProvider {
    readonly name: string;
    readonly configId: string;
    readonly deprecatedRemovalTarget?: string;
}

export const AUTH_PROVIDERS_CATALOG = {
    Simple: {
        name: 'simple',
        configId: 'unleash.auth.simple',
    } as AuthProvider,

    OIDC: {
        name: 'oidc',
        configId: 'unleash.enterprise.auth.oidc',
    } as AuthProvider,

    SAML: {
        name: 'saml',
        configId: 'unleash.enterprise.auth.saml',
    } as AuthProvider,

    Google: {
        name: 'google',
        configId: 'unleash.enterprise.auth.google',
        deprecatedRemovalTarget: 'v8.0.0',
    } as AuthProvider,
} as const;
