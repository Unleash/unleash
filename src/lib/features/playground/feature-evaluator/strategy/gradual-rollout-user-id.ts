import { Strategy } from './strategy';
import type { Context } from '../context';
import { normalizedStrategyValue } from './util';

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
