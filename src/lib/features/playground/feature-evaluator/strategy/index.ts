import DefaultStrategy from './default-strategy.js';
import GradualRolloutRandomStrategy from './gradual-rollout-random.js';
import GradualRolloutUserIdStrategy from './gradual-rollout-user-id.js';
import GradualRolloutSessionIdStrategy from './gradual-rollout-session-id.js';
import RemoteAddressStrategy from './remote-address-strategy.js';
import FlexibleRolloutStrategy from './flexible-rollout-strategy.js';
import type { Strategy } from './strategy.js';
import UnknownStrategy from './unknown-strategy.js';
import ApplicationHostnameStrategy from './application-hostname-strategy.js';

export { Strategy } from './strategy.js';
export type { StrategyTransportInterface } from './strategy.js';

export const defaultStrategies: Array<Strategy> = [
    new DefaultStrategy(),
    new ApplicationHostnameStrategy(),
    new GradualRolloutRandomStrategy(),
    new GradualRolloutUserIdStrategy(),
    new GradualRolloutSessionIdStrategy(),
    new RemoteAddressStrategy(),
    new FlexibleRolloutStrategy(),
    new UnknownStrategy(),
];
