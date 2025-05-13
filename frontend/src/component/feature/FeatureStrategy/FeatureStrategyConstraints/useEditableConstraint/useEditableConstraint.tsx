import { useEffect, useMemo, useReducer } from 'react';
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
    legalValueData?: LegalValueData;
    constraint: EditableConstraint;
};

export const useEditableConstraint = (
    constraint: IConstraint,
    onUpdate: (constraint: IConstraint) => void,
): EditableConstraintState => {
    const [localConstraint, updateConstraint] = useReducer(
        constraintReducer,
        fromIConstraint(constraint),
    );
    useEffect(() => {
        onUpdate(toIConstraint(localConstraint));
    }, [localConstraint, updateConstraint]);

    const { context } = useUnleashContext();

    const contextDefinition = useMemo(
        () => resolveContextDefinition(context, localConstraint.contextName),
        [JSON.stringify(context), localConstraint.contextName],
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

    const legalValueData = contextDefinition.legalValues?.length
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
        legalValueData,
    } as EditableConstraintState;
};
