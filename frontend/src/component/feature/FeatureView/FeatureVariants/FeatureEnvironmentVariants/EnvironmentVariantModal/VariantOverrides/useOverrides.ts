import { useReducer } from 'react';
import { IOverride } from 'interfaces/featureToggle';

type OverridesReducerAction =
    | { type: 'SET'; payload: IOverride[] }
    | { type: 'CLEAR' }
    | { type: 'ADD'; payload: IOverride }
    | { type: 'REMOVE'; payload: number }
    | { type: 'UPDATE_VALUES_AT'; payload: [number, IOverride['values']] }
    | { type: 'UPDATE_TYPE_AT'; payload: [number, IOverride['contextName']] };

const overridesReducer = (
    state: IOverride[],
    action: OverridesReducerAction
) => {
    switch (action.type) {
        case 'SET':
            return action.payload;
        case 'CLEAR':
            return [];
        case 'ADD':
            return [...state, action.payload];
        case 'REMOVE':
            return state.filter((_, index) => index !== action.payload);
        case 'UPDATE_VALUES_AT':
            const [index1, values] = action.payload;
            return state.map((item, i) =>
                i === index1 ? { ...item, values } : item
            );
        case 'UPDATE_TYPE_AT':
            const [index2, contextName] = action.payload;
            return state.map((item, i) =>
                i === index2 ? { ...item, contextName } : item
            );
    }
};

export const useOverrides = (initialValue: IOverride[] = []) =>
    useReducer(overridesReducer, initialValue);

export type OverridesDispatchType = ReturnType<typeof useOverrides>[1];
