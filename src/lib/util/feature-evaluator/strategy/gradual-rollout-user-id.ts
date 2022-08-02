import { Strategy } from './strategy';
import { Context } from '../context';
import normalizedValue from './util';

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

        const normalizedUserId = normalizedValue(userId, groupId);

        return percentage > 0 && normalizedUserId <= percentage;
    }
}
