import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { Request } from 'express';
import semver from 'semver';
import {
    CapabilityFeature,
    clientHasCapability,
    isKnownCapabilityClientName,
} from '../capability';

export class CapabilityService {
    private logger: Logger;

    private static CLIENT_NAME_HEADER = 'Unleash-Client-Name';

    private static CLIENT_VERSION_HEADER = 'Unleash-Client-Version';

    constructor(config: IUnleashConfig) {
        this.logger = config.getLogger('services/capability-service.ts');
    }

    requestHasCapability(
        request: Request,
        feature: CapabilityFeature,
    ): boolean {
        return this.clientHasCapability(
            feature,
            request.header(CapabilityService.CLIENT_NAME_HEADER),
            request.header(CapabilityService.CLIENT_VERSION_HEADER),
        );
    }

    clientHasCapability(
        feature: CapabilityFeature,
        client: string | undefined,
        version: string | undefined,
    ): boolean {
        if (!client && !version) {
            return false;
        }

        if (!isKnownCapabilityClientName(client)) {
            this.logger.warn(`Unknown capability client name: ${client}`);
            return false;
        }

        const parsedVersion = semver.parse(version);
        if (!parsedVersion) {
            this.logger.warn(`Unknown capability client version: ${version}`);
            return false;
        }

        return clientHasCapability(feature, client, parsedVersion);
    }
}
