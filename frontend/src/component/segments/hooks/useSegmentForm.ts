import type { IConstraint, IConstraintWithId } from 'interfaces/strategy';
import { useEffect, useState } from 'react';
import { useSegmentValidation } from 'hooks/api/getters/useSegmentValidation/useSegmentValidation';
import { v4 as uuidv4 } from 'uuid';
import { constraintId } from 'constants/constraintId';

export const useSegmentForm = (
    initialName = '',
    initialDescription = '',
    initialProject?: string,
    initialConstraints: IConstraint[] = [],
) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [project, setProject] = useState<string | undefined>(initialProject);
    const initialConstraintsWithId = initialConstraints.map((constraint) => ({
        [constraintId]: uuidv4(),
        ...constraint,
    }));
    const [constraints, setConstraints] = useState<IConstraintWithId[]>(
        initialConstraintsWithId,
    );
    const [errors, setErrors] = useState({});
    const nameError = useSegmentValidation(name, initialName);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        setDescription(initialDescription);
    }, [initialDescription]);

    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);

    useEffect(() => {
        setConstraints(initialConstraintsWithId);
        // eslint-disable-next-line
    }, [JSON.stringify(initialConstraints)]);

    useEffect(() => {
        setErrors((errors) => ({
            ...errors,
            name: nameError,
        }));
    }, [nameError]);

    const getSegmentPayload = () => {
        const sortedConstraints = constraints.map((constraint) => {
            const { inverted, operator, contextName, caseInsensitive } =
                constraint;
            const baseProps = {
                inverted,
                operator,
                contextName,
                caseInsensitive,
            };
            return constraint.values
                ? {
                      values: constraint.values,
                      ...baseProps,
                  }
                : {
                      value: constraint.value,
                      ...baseProps,
                  };
        });
        return {
            name,
            description,
            project,
            constraints: sortedConstraints,
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
        project,
        setProject,
        constraints,
        setConstraints: setConstraints as React.Dispatch<
            React.SetStateAction<IConstraint[]>
        >,
        getSegmentPayload,
        clearErrors,
        errors,
    };
};
