import { IConstraint } from 'interfaces/strategy';
import { useEffect, useState } from 'react';

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
