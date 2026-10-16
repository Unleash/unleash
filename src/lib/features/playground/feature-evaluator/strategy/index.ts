import { defaultStrategies } from 'unleash-client/lib/strategy/index.js';
import { StrategyExplainer } from './strategy.js';
import { UnknownStrategyExplainer } from './unknown-strategy.js';

export { StrategyExplainer } from './strategy.js';

/**
 * Used for every strategy the playground cannot evaluate: custom strategies
 * and applicationHostname, whose result depends on the machine the SDK runs
 * on rather than on the context.
 */
export const unknownStrategyExplainer = new UnknownStrategyExplainer();

export const explainedDefaultStrategies: StrategyExplainer[] = defaultStrategies
    .filter((strategy) => strategy.name !== 'applicationHostname')
    .map((strategy) => new StrategyExplainer(strategy));
