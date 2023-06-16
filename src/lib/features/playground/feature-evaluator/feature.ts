import { StrategyTransportInterface } from './strategy';
import { Segment } from './strategy/strategy';
// eslint-disable-next-line import/no-cycle
import { VariantDefinition } from './variant';

export interface FeatureInterface {
    name: string;
    type: string;
    description?: string;
    enabled: boolean;
    stale: boolean;
    impressionData: boolean;
    strategies: StrategyTransportInterface[];
    variants: VariantDefinition[];
}

export interface ClientFeaturesResponse {
    version: number;
    features: FeatureInterface[];
    query?: any;
    segments?: Segment[];
}
