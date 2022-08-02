import { ClientFeaturesResponse, FeatureInterface } from '../feature';
import { Segment } from '../strategy/strategy';

export interface BootstrapProvider {
    readBootstrap(): Promise<ClientFeaturesResponse | undefined>;
}

export interface BootstrapOptions {
    data: FeatureInterface[];
    segments?: Segment[];
}

export class DefaultBootstrapProvider implements BootstrapProvider {
    private data?: FeatureInterface[];

    private segments?: Segment[];

    constructor(options: BootstrapOptions) {
        this.data = options.data;
        this.segments = options.segments;
    }

    async readBootstrap(): Promise<ClientFeaturesResponse | undefined> {
        if (this.data) {
            return {
                version: 2,
                segments: this.segments,
                features: [...this.data],
            };
        }
        return undefined;
    }
}

export function resolveBootstrapProvider(
    options: BootstrapOptions,
): BootstrapProvider {
    return new DefaultBootstrapProvider(options);
}
