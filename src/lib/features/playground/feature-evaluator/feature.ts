import type { StrategyTransportInterface } from './strategy';
import type { Segment } from './strategy/strategy';
// eslint-disable-next-line import/no-cycle
import type { VariantDefinition } from './variant';

export interface Dependency {
    feature: string;
    variants?: string[];
    enabled?: boolean;
}

export interface FeatureInterface {
    name: string;
    type: string;
    description?: string;
    enabled: boolean;
    stale: boolean;
    impressionData: boolean;
    strategies: StrategyTransportInterface[];
    variants: VariantDefinition[];
    dependencies?: Dependency[];
}

export interface ClientFeaturesResponse {
    version: number;
    features: FeatureInterface[];
    query?: any;
    segments?: Segment[];
}
