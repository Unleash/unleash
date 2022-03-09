import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useEffect, useState } from 'react';
import { IConstraint } from 'interfaces/strategy';

export const useConstraintsValidation = (
    projectId: string,
    featureId: string,
    constraints?: IConstraint[]
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

        const validationRequests = constraints.map(constraint => {
            return validateConstraint(projectId, featureId, constraint);
        });

        Promise.all(validationRequests)
            .then(() => setValid(true))
            .catch(() => setValid(false));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId, featureId, constraints]);

    return valid;
};
