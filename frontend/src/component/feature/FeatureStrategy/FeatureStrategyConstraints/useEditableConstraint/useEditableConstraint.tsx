import { useMemo, useState } from 'react';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableConstraint,
    fromIConstraint,
    isSingleValueConstraint,
    toIConstraint,
} from './editable-constraint-type';
import type {
    ILegalValue,
    IUnleashContextDefinition,
} from 'interfaces/context';
import {
    constraintReducer,
    type ConstraintUpdateAction,
} from './constraint-reducer';
import {
    type ConstraintValidationResult,
    constraintValidator,
} from './constraint-validator';
import {
    getDeletedLegalValues,
    getInvalidLegalValues,
} from './legal-value-functions';

const resolveContextDefinition = (
    context: IUnleashContextDefinition[],
    contextName: string,
): IUnleashContextDefinition => {
    const definition = context.find(
        (contextDef) => contextDef.name === contextName,
    );

    return (
        definition || {
            name: '',
            description: '',
            createdAt: '',
            sortOrder: 1,
            stickiness: false,
        }
    );
};

type LegalValueData = {
    legalValues: ILegalValue[];
    deletedLegalValues?: Set<string>;
    invalidLegalValues?: Set<string>;
};

type EditableConstraintState = {
    updateConstraint: (action: ConstraintUpdateAction) => void;
    validator: (...values: string[]) => ConstraintValidationResult;
    legalValues?: LegalValueData;
    constraint: EditableConstraint;
};

export const useEditableConstraint = (
    constraint: IConstraint,
    onUpdate: (constraint: IConstraint) => void,
): EditableConstraintState => {
    const [localConstraint, setLocalConstraint] = useState(() => {
        return fromIConstraint(constraint);
    });

    const { context } = useUnleashContext();
    const [contextDefinition, setContextDefinition] = useState(
        resolveContextDefinition(context, localConstraint.contextName),
    );

    const validator = constraintValidator(localConstraint);

    const deletedLegalValues = useMemo(() => {
        if (
            contextDefinition.legalValues?.length &&
            constraint.values?.length
        ) {
            return getDeletedLegalValues(
                contextDefinition.legalValues,
                constraint.values,
            );
        }
        return undefined;
    }, [
        JSON.stringify(contextDefinition.legalValues),
        JSON.stringify(constraint.values),
    ]);

    const invalidLegalValues = useMemo(() => {
        if (
            contextDefinition.legalValues?.length &&
            isSingleValueConstraint(localConstraint)
        ) {
            return getInvalidLegalValues(
                (value) => validator(value)[0],
                contextDefinition.legalValues,
            );
        }
        return undefined;
    }, [
        JSON.stringify(contextDefinition.legalValues),
        JSON.stringify(localConstraint.operator),
    ]);

    const updateConstraint = (action: ConstraintUpdateAction) => {
        const nextState = constraintReducer(
            localConstraint,
            action,
            deletedLegalValues,
        );
        const contextFieldHasChanged =
            localConstraint.contextName !== nextState.contextName;

        setLocalConstraint(nextState);
        onUpdate(toIConstraint(nextState));

        if (contextFieldHasChanged) {
            setContextDefinition(
                resolveContextDefinition(context, nextState.contextName),
            );
        }
    };

    const legalValues = contextDefinition.legalValues?.length
        ? {
              legalValues: contextDefinition.legalValues,
              invalidLegalValues,
              deletedLegalValues,
          }
        : undefined;

    return {
        updateConstraint,
        constraint: localConstraint,
        validator,
        legalValues,
    } as EditableConstraintState;
};
