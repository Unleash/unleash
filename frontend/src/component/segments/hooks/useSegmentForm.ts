import { IConstraint } from 'interfaces/strategy';
import { useEffect, useState } from 'react';
import { useSegmentValidation } from 'hooks/api/getters/useSegmentValidation/useSegmentValidation';

export const useSegmentForm = (
    initialName = '',
    initialDescription = '',
    initialConstraints: IConstraint[] = []
) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [constraints, setConstraints] =
        useState<IConstraint[]>(initialConstraints);
    const [errors, setErrors] = useState({});
    const nameError = useSegmentValidation(name, initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    useEffect(() => {
        setConstraints(initialConstraints);
        // eslint-disable-next-line
    }, [JSON.stringify(initialConstraints)]);

    useEffect(() => {
        setErrors(errors => ({
            ...errors,
            name: nameError,
        }));
    }, [nameError]);

    const getSegmentPayload = () => {
        return {
            name,
            description,
            constraints,
        };
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        name,
        setName,
        description,
        setDescription,
        constraints,
        setConstraints,
        getSegmentPayload,
        clearErrors,
        errors,
    };
};
