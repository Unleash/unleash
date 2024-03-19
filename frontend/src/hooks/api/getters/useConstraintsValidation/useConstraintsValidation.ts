import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useEffect, useState } from 'react';
import type { IConstraint } from 'interfaces/strategy';

const isValid = (constraint: IConstraint) => {
    const hasValues =
        Array.isArray(constraint.values) && constraint.values.length > 0;
    const hasValue = Boolean(constraint.value);

    return hasValues || hasValue;
};

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

        const invalidConstraints = constraints.find((item) => !isValid(item));
        if (invalidConstraints) {
            setValid(false);
            return;
        }

        const validationRequests = constraints
            .filter(isValid)
            .map((constraint) => {
                return validateConstraint(constraint);
            });

        Promise.all(validationRequests)
            .then(() => setValid(true))
            .catch(() => setValid(false));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(constraints)]);

    return valid;
};
