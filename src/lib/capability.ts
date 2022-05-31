import semver, { SemVer } from 'semver';
import { mustParseSemVer } from './util/semver';

const capabilityFeatures = ['segments'] as const;

const capabilityClients = ['unleash-client-node', 'unleash-client-go'] as const;

export type CapabilityFeature = typeof capabilityFeatures[number];

export type CapabilityClient = typeof capabilityClients[number];

const capabilitySupportMap: Record<
    CapabilityFeature,
    Partial<Record<CapabilityClient, SemVer>>
> = {
    segments: {
        'unleash-client-node': mustParseSemVer('3.14.0'),
    },
};

export const clientHasCapability = (
    feature: CapabilityFeature,
    client: CapabilityClient,
    version: SemVer,
): boolean => {
    const supportedVersion = capabilitySupportMap[feature][client];
    return supportedVersion ? semver.gte(version, supportedVersion) : false;
};

export const isKnownCapabilityClientName = (
    client: string | undefined,
): client is CapabilityClient => {
    return capabilityClients.includes(client as unknown as CapabilityClient);
};
