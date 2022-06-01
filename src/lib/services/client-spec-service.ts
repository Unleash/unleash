import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { Request } from 'express';
import semver, { SemVer } from 'semver';
import BadDataError from '../error/bad-data-error';
import { mustParseStrictSemVer, parseStrictSemVer } from '../util/semver';

export type ClientSpecFeature = 'segments';

export class ClientSpecService {
    private readonly logger: Logger;

    private readonly clientSpecHeader = 'Unleash-Client-Spec';

    private readonly clientSpecFeatures: Record<ClientSpecFeature, SemVer> = {
        segments: mustParseStrictSemVer('4.2.0'),
    };

    constructor(config: Pick<IUnleashConfig, 'getLogger'>) {
        this.logger = config.getLogger('services/capability-service.ts');
    }

    requestSupportsSpec(request: Request, feature: ClientSpecFeature): boolean {
        return this.versionSupportsSpec(
            feature,
            request.header(this.clientSpecHeader),
        );
    }

    versionSupportsSpec(
        feature: ClientSpecFeature,
        version: string | undefined,
    ): boolean {
        if (!version) {
            return false;
        }

        const parsedVersion = parseStrictSemVer(version);

        if (!parsedVersion && !/^\d/.test(version)) {
            throw new BadDataError(
                `Invalid prefix in the ${this.clientSpecHeader} header: "${version}".`,
            );
        }

        if (!parsedVersion) {
            throw new BadDataError(
                `Invalid SemVer in the ${this.clientSpecHeader} header: "${version}".`,
            );
        }

        return semver.gte(parsedVersion, this.clientSpecFeatures[feature]);
    }
}
