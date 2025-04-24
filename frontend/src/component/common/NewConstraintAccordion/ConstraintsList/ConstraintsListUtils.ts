import type React from 'react';
import { useImperativeHandle } from 'react';
import type { IConstraint } from 'interfaces/strategy';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useWeakMap } from 'hooks/useWeakMap';
import { createEmptyConstraint } from 'component/common/LegacyConstraintAccordion/ConstraintAccordionList/createEmptyConstraint';

// Common props interface
export interface IConstraintsListProps {
    constraints: IConstraint[];
    setConstraints?: React.Dispatch<React.SetStateAction<IConstraint[]>>;
}

// Common ref interface
export interface IConstraintsListRef {
    addConstraint?: (contextName: string) => void;
}

// Common state interface
export interface IConstraintsListItemState {
    new?: boolean;
    editing?: boolean;
}

// Shared hook for both editable and viewable constraints lists
export const useConstraintsList = (
    setConstraints:
        | React.Dispatch<React.SetStateAction<IConstraint[]>>
        | undefined,
    ref: React.RefObject<IConstraintsListRef>,
) => {
    const state = useWeakMap<IConstraint, IConstraintsListItemState>();
    const { context } = useUnleashContext();

    const addConstraint =
        setConstraints &&
        ((contextName: string) => {
            const constraint = createEmptyConstraint(contextName);
            state.set(constraint, { editing: true, new: true });
            setConstraints((prev) => [...prev, constraint]);
        });

    useImperativeHandle(ref, () => ({
        addConstraint,
    }));

    const onAdd =
        addConstraint &&
        (() => {
            addConstraint(context[0].name);
        });

    return { onAdd, state, context };
};
