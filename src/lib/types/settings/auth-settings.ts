export const AUTH_PROVIDERS_CATALOG: ReadonlyArray<{
    name: string;
    configId: string;
    deprecatedRemovalTarget?: string; // if set, the value is the planned removal release
}> = [
    { name: 'simple', configId: 'unleash.auth.simple' },
    { name: 'oidc', configId: 'unleash.enterprise.auth.oidc' },
    { name: 'saml', configId: 'unleash.enterprise.auth.saml' },
    {
        name: 'google',
        configId: 'unleash.enterprise.auth.google',
        deprecatedRemovalTarget: 'v8.0.0',
    },
];

export function getAuthConfigId(providerName: string): string {
    const provider = AUTH_PROVIDERS_CATALOG.find(
        (p) => p.name === providerName,
    );
    return provider?.configId ?? '';
}
