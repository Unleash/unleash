import { isTimeCondition } from 'interfaces/releasePlans';
import type { TransitionConditionSchema } from 'openapi';

export const isSameCondition = (
    a: TransitionConditionSchema,
    b: TransitionConditionSchema,
) => {
    if (isTimeCondition(a) && isTimeCondition(b)) {
        return a.intervalMinutes === b.intervalMinutes;
    }
    if (!isTimeCondition(a) && !isTimeCondition(b)) {
        return a.minimumExposures === b.minimumExposures;
    }
    return false;
};
