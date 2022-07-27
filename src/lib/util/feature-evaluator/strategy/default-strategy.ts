import { StrategyEvaluationResult } from '../client';
import { Strategy } from './strategy';

export default class DefaultStrategy extends Strategy {
    constructor() {
        super('default');
    }

    isEnabled(): StrategyEvaluationResult {
        // console.log('default-strategy.isEnabled');

        return {
            result: true,
            // reasons: ['The default strategy is on for all users.'],
        };
    }
}
