import { Strategy } from './strategy.js';
import { normalizedStrategyValue } from './util.js';
import type { Context } from '../context.js';

export default class GradualRolloutSessionIdStrategy extends Strategy {
    constructor() {
        super('gradualRolloutSessionId');
    }

    isEnabled(
        parameters: { percentage: number | string; groupId?: string },
        context: Context,
    ): boolean {
        const { sessionId } = context;
        if (!sessionId) {
            return false;
        }

        const percentage = Number(parameters.percentage);
        const groupId = parameters.groupId || '';

        const normalizedId = normalizedStrategyValue(sessionId, groupId);

        return percentage > 0 && normalizedId <= percentage;
    }
}
