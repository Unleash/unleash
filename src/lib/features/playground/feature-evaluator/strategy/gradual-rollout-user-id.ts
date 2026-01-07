import { Strategy } from './strategy.js';
import type { Context } from '../context.js';
import { normalizedStrategyValue } from './util.js';

export default class GradualRolloutUserIdStrategy extends Strategy {
    constructor() {
        super('gradualRolloutUserId');
    }

    isEnabled(
        parameters: { percentage: number | string; groupId?: string },
        context: Context,
    ): boolean {
        const { userId } = context;
        if (!userId) {
            return false;
        }

        const percentage = Number(parameters.percentage);
        const groupId = parameters.groupId || '';

        const normalizedUserId = normalizedStrategyValue(userId, groupId);

        return percentage > 0 && normalizedUserId <= percentage;
    }
}
