import { useMemo, useState } from 'react';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableConstraint,
    fromIConstraint,
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
    dateOperators,
    multipleValueOperators,
    numOperators,
    type Operator,
    semVerOperators,
} from 'constants/operators';

type Props = {
    constraint: IConstraint;
    onDelete: () => void;
    onAutoSave: (constraint: IConstraint) => void;
};

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

type ConstraintMetadata =
    | {
          type: 'legal values';
          legalValues: ILegalValue[];
          deletedLegalValues?: Set<string>;
      }
    | { type: 'date' }
    | { type: 'single value'; variant: 'number' | 'semver' }
    | { type: 'multiple values' };

type EditableConstraintState = {
    constraint: EditableConstraint;
    updateConstraint: (action: ConstraintUpdateAction) => void;
} & ConstraintMetadata;

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

    const getMetadata = (operator: Operator): ConstraintMetadata => {
        if (multipleValueOperators.includes(localConstraint.operator)) {
            if (contextDefinition.legalValues?.length) {
                return {
                    type: 'legal values',
                    deletedLegalValues,
                    legalValues: contextDefinition.legalValues,
                };
            } else {
                return {
                    type: 'multiple values',
                };
            }
        } else if (dateOperators.includes(localConstraint.operator)) {
            return { type: 'date' };
        } else if (numOperators.includes(localConstraint.operator)) {
            return { type: 'single value', variant: 'number' };
        } else if (semVerOperators.includes(localConstraint.operator)) {
            return { type: 'single value', variant: 'semver' };
        }

        // shouldn't ever end up here? Todo: test
        return { type: 'multiple values' };
    };

    return {
        updateConstraint,
        constraint: localConstraint,
        ...getMetadata(localConstraint.operator),
    };
};
