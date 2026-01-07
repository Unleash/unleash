import { useEffect, useMemo, useReducer } from 'react';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableConstraint,
    fromIConstraint,
    isMultiValueConstraint,
    isSingleValueConstraint,
    toIConstraint,
} from './editable-constraint-type.ts';
import type {
    ILegalValue,
    IUnleashContextDefinition,
} from 'interfaces/context';
import {
    constraintReducer,
    type ConstraintUpdateAction,
} from './constraint-reducer.ts';
import {
    constraintValidator,
    type ConstraintValidationResult,
} from './constraint-validator.ts';
import {
    getDeletedLegalValues,
    getInvalidLegalValues,
} from './legal-value-functions.ts';
import { useEffectiveProjectContext } from 'hooks/api/getters/useUnleashContext/useEffectiveProjectContext.ts';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

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
    const [constraintState, updateConstraint] = useReducer(
        constraintReducer,
        fromIConstraint(constraint),
    );
    const { deletedLegalValues, ...localConstraint } = constraintState;
    useEffect(() => {
        onUpdate(toIConstraint(localConstraint));
    }, [constraintState]);

    const projectId = useOptionalPathParam('projectId');
    const { context } = useEffectiveProjectContext(projectId);

    const contextDefinition = useMemo(
        () => resolveContextDefinition(context, localConstraint.contextName),
        [JSON.stringify(context), localConstraint.contextName],
    );

    const baseValidator = constraintValidator(localConstraint.operator);

    const validator = (...values: string[]) => {
        if (
            isMultiValueConstraint(localConstraint) &&
            values.every((value) => localConstraint.values.has(value))
        ) {
            if (values.length === 1) {
                return [false, `${values[0]} is already added.`];
            }
            return [false, `All the values are already added`];
        }
        return baseValidator(...values);
    };

    useEffect(() => {
        if (
            contextDefinition.legalValues?.length &&
            constraint.values?.length
        ) {
            const deletedLegalValues = getDeletedLegalValues(
                contextDefinition.legalValues,
                constraint.values,
            );

            updateConstraint({
                type: 'deleted legal values update',
                payload: deletedLegalValues,
            });
        }
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
                (value) => baseValidator(value)[0],
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
