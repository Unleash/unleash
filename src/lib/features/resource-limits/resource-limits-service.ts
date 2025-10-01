import type { IUnleashConfig } from '../../types/option.js';
import type { ResourceLimitsSchema } from '../../openapi/index.js';

export class ResourceLimitsService {
    private config: IUnleashConfig;

    constructor(config: IUnleashConfig) {
        this.config = config;
    }

    async getResourceLimits(): Promise<ResourceLimitsSchema> {
        return this.config.resourceLimits;
    }
}
