import {
    OFFICIAL_SDKS,
    SDK_ICONS,
    type SdkName,
} from '../../integrations/IntegrationList/AvailableIntegrations/SDKs.ts';

export type { SdkName };
export type SdkType = 'client' | 'frontend';
export type Sdk = { name: SdkName; type: SdkType };

export const serverSdks = OFFICIAL_SDKS.filter(
    (sdk) => sdk.type === 'server',
).map(({ name }) => ({
    name: SDK_ICONS[name].title,
    icon: SDK_ICONS[name].icon,
}));

export const clientSdks = OFFICIAL_SDKS.filter(
    (sdk) => sdk.type === 'client',
).map(({ name }) => ({
    name: SDK_ICONS[name].title,
    icon: SDK_ICONS[name].icon,
}));

export const allSdks = [...serverSdks, ...clientSdks];
