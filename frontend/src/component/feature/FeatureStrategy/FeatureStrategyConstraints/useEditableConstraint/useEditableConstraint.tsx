import { useMemo, useState } from 'react';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableMultiValueConstraint,
    type EditableSingleValueConstraint,
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
import { difference } from './set-functions';

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

type SingleValueConstraintState = {
    constraint: EditableSingleValueConstraint;
};

type MultiValueConstraintState = {
    constraint: EditableMultiValueConstraint;
};

type LegalValueData = {
    legalValues: ILegalValue[];
    deletedLegalValues?: Set<string>;
    invalidLegalValues?: Set<string>;
};

type LegalValueConstraintState = {
    constraint: EditableMultiValueConstraint;
} & LegalValueData;

type EditableConstraintState = {
    updateConstraint: (action: ConstraintUpdateAction) => void;
    validator: (...values: string[]) => ConstraintValidationResult;
} & (
    | SingleValueConstraintState
    | MultiValueConstraintState
    | LegalValueConstraintState
);

export const useEditableConstraint = (
    constraint: IConstraint,
    onAutoSave: (constraint: IConstraint) => void,
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
            // todo: extract and test
            const currentLegalValues = new Set(
                contextDefinition.legalValues.map(({ value }) => value),
            );
            const deletedValues = difference(
                constraint.values,
                currentLegalValues,
            );

            return deletedValues;
        }
        return undefined;
    }, [
        JSON.stringify(contextDefinition.legalValues),
        JSON.stringify(constraint.values),
    ]);

    const invalidLegalValues = useMemo(() => {
        if (contextDefinition.legalValues?.length) {
            // todo: extract and test
            return new Set(
                contextDefinition.legalValues
                    .filter(({ value }) => !validator(value)[0])
                    .map(({ value }) => value),
            );
        }
        return undefined;
    }, [
        JSON.stringify(contextDefinition.legalValues),
        JSON.stringify(constraint.operator),
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
        onAutoSave(toIConstraint(nextState));

        if (contextFieldHasChanged) {
            setContextDefinition(
                resolveContextDefinition(context, nextState.contextName),
            );
        }
    };

    if (contextDefinition.legalValues?.length) {
        if (isSingleValueConstraint(localConstraint)) {
            return {
                updateConstraint,
                constraint: localConstraint,
                validator,
                legalValues: contextDefinition.legalValues,
                invalidLegalValues,
                deletedLegalValues,
            };
        }
        return {
            updateConstraint,
            constraint: localConstraint,
            validator,
            legalValues: contextDefinition.legalValues,
            invalidLegalValues,
            deletedLegalValues,
        };
    }
    if (isSingleValueConstraint(localConstraint)) {
        return {
            updateConstraint,
            constraint: localConstraint,
            validator,
        };
    }

    return {
        updateConstraint,
        constraint: localConstraint,
        validator,
    };
};
