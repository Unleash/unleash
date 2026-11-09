import { useCallback, useState } from 'react';
import type { MilestoneStatus } from '../ReleasePlanMilestone/ReleasePlanMilestoneStatus.tsx';
import type { TransitionConditionSchema } from 'openapi';
import { getTransitionConditionError } from '../utils/getTransitionConditionError.ts';
import { useTransitionConditionInput } from './useTransitionConditionInput.ts';

export const useTransitionConditionForm = ({
    initialCondition,
    sourceMilestoneStartedAt,
    status,
}: {
    initialCondition?: TransitionConditionSchema;
    sourceMilestoneStartedAt?: string | null;
    status?: MilestoneStatus;
}) => {
    const form = useTransitionConditionInput(initialCondition);
    const [error, setError] = useState<string | undefined>();

    const validate = () => {
        const validationError = getTransitionConditionError({
            value: form.value,
            unit: form.unit,
            sourceMilestoneStartedAt,
            status,
        });
        setError(validationError);
        return validationError === undefined;
    };

    const clearError = useCallback(() => {
        setError(undefined);
    }, []);

    return { form, validation: { error, validate, clearError } };
};
