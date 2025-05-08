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
};

type LegalValueConstraintState =
    | {
          constraint: EditableMultiValueConstraint;
      }
    | LegalValueData;

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

    const deletedLegalValues = useMemo(() => {
        if (
            contextDefinition.legalValues?.length &&
            constraint.values?.length
        ) {
            const currentLegalValues = new Set(
                contextDefinition.legalValues.map(({ value }) => value),
            );
            const deletedValues = new Set(constraint.values).difference(
                currentLegalValues,
            );

            return deletedValues;
        }
        return undefined;
    }, [
        JSON.stringify(contextDefinition.legalValues),
        JSON.stringify(constraint.values),
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

    if (isSingleValueConstraint(localConstraint)) {
        return {
            updateConstraint,
            constraint: localConstraint,
            validator: constraintValidator(localConstraint),
        };
    }
    if (contextDefinition.legalValues?.length) {
        return {
            updateConstraint,
            constraint: localConstraint,
            validator: constraintValidator(localConstraint),
            legalValues: contextDefinition.legalValues,
            deletedLegalValues,
        };
    }

    return {
        updateConstraint,
        constraint: localConstraint,
        validator: constraintValidator(localConstraint),
    };
};
