import { isTimeCondition } from 'interfaces/releasePlans';
import type { TransitionConditionSchema } from 'openapi';

export const isValidAutomation = (condition: TransitionConditionSchema) => {
    const minimumValue = isTimeCondition(condition)
        ? condition.intervalMinutes
        : condition.minimumExposures;

    return minimumValue >= 1;
};
