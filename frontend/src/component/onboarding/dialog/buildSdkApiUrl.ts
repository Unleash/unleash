import { clientSdks, type SdkName } from './sharedTypes.ts';

/**
 * Server SDKs (Node.js, Go, Python, …) talk to the regular client API at
 * `/api/`. Client SDKs (React, Vue, JavaScript, …) talk to the frontend API
 * at `/api/frontend/`.
 */
export const buildSdkApiUrl = (
    unleashUrl: string | undefined,
    sdkName: SdkName,
): string => {
    const isFrontendSdk = clientSdks.some((sdk) => sdk.name === sdkName);
    return `${unleashUrl}/api${isFrontendSdk ? '/frontend' : ''}/`;
};
