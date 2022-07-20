import { ClientFeaturesResponse, FeatureInterface } from '../feature';

export interface BootstrapProvider {
    readBootstrap(): Promise<ClientFeaturesResponse | undefined>;
}

export interface BootstrapOptions {
    // data: [FeatureInterface, ...FeatureInterface[]];
    data: FeatureInterface[];
}

export class DefaultBootstrapProvider implements BootstrapProvider {
    private data?: FeatureInterface[];
    constructor(options: BootstrapOptions) {
        this.data = options.data;
    }

    async readBootstrap(): Promise<ClientFeaturesResponse | undefined> {
        if (this.data) {
            return { version: 2, features: [...this.data] };
        }
        return undefined;
    }
}

export function resolveBootstrapProvider(
    options: BootstrapOptions,
): BootstrapProvider {
    return new DefaultBootstrapProvider(options);
}
