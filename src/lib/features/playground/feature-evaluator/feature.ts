import { StrategyTransportInterface } from './strategy';
import { Segment } from './strategy/strategy';
// eslint-disable-next-line import/no-cycle
import { VariantDefinition } from './variant';

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
