import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useEffect, useState } from 'react';
import type { IConstraint } from 'interfaces/strategy';

export const constraintHasValues = (constraint: IConstraint) => {
    const hasValues =
        Array.isArray(constraint.values) && constraint.values.length > 0;
    const hasValue = Boolean(constraint.value);

    return hasValues || hasValue;
};

export const withIncompleteConstraintsDiscarded = <
    T extends { constraints?: IConstraint[] },
>(
    strategy: T,
): T => ({
    ...strategy,
    constraints: (strategy.constraints ?? []).filter(constraintHasValues),
});

export const validateConstraints = (
    constraints: IConstraint[],
    validateConstraint: (constraint: IConstraint) => Promise<void>,
): Promise<void[]> =>
    Promise.all(
        constraints.filter(constraintHasValues).map(validateConstraint),
    );

export const useConstraintsValidation = (
    constraints?: IConstraint[],
): boolean => {
    // An empty list of constraints is valid. An undefined list is not.
    // A non-empty list has to be checked by calling the backend.
    const isEmptyList = Boolean(constraints && constraints.length === 0);
    const [valid, setValid] = useState(isEmptyList);
    const { validateConstraint } = useFeatureApi();

    useEffect(() => {
        if (!constraints) {
            return;
        }

        const hasIncompleteConstraints = constraints.some(
            (item) => !constraintHasValues(item),
        );
        if (hasIncompleteConstraints) {
            setValid(false);
            return;
        }

        validateConstraints(constraints, validateConstraint)
            .then(() => setValid(true))
            .catch(() => setValid(false));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(constraints)]);

    return valid;
};
