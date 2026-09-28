import type { FeatureInterface as SdkFeatureInterface } from 'unleash-client/lib/feature.js';
import type {
    Constraint,
    Segment as SdkSegment,
    StrategyTransportInterface as SdkStrategyTransportInterface,
} from 'unleash-client/lib/strategy/strategy.js';

/**
 * The playground evaluates strategies the SDK never receives from the
 * client API (disabled ones) and displays fields the SDK does not need
 * (id, title, segment name). These types add those fields on top of the
 * SDK's own types so the evaluation itself stays the SDK's. Parameters are
 * narrowed to strings because that is what the playground schema returns.
 */
export type StrategyTransportInterface = Omit<
    SdkStrategyTransportInterface,
    'parameters'
> & {
    parameters: Record<string, string>;
    id?: string;
    title?: string;
    disabled?: boolean;
};

export type FeatureInterface = Omit<SdkFeatureInterface, 'strategies'> & {
    strategies?: StrategyTransportInterface[];
};

export type Segment = SdkSegment & {
    name: string;
};

export type { Constraint };
