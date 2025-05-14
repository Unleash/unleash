import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { IConstraint } from 'interfaces/strategy';

export const getConstraintKey = (constraint: IConstraint): string => {
    const sortedValues = (values?: string[]) =>
        values ? [...values].sort() : undefined;

    return JSON.stringify({
        contextName: constraint.contextName,
        operator: constraint.operator,
        values: sortedValues(constraint.values),
        value: constraint.value,
        inverted: constraint.inverted,
        caseInsensitive: constraint.caseInsensitive,
    });
};

export const areConstraintsEqual = (
    a: IConstraint,
    b: IConstraint,
): boolean => {
    const aKey = getConstraintKey(a);
    const bKey = getConstraintKey(b);

    return aKey === bKey;
};

export const useRecentlyUsedConstraints = (
    initialItems: IConstraint[] = [],
) => {
    const [items, setItems] = useLocalStorageState<IConstraint[]>(
        'recently-used-constraints',
        initialItems,
    );

    const addItem = (newItem: IConstraint | IConstraint[]) => {
        setItems((prevItems) => {
            const itemsToAdd = Array.isArray(newItem) ? newItem : [newItem];

            let updatedItems = [...prevItems];

            itemsToAdd.forEach((item) => {
                updatedItems = updatedItems.filter(
                    (existingItem) => !areConstraintsEqual(existingItem, item),
                );
                updatedItems = [item, ...updatedItems];
            });
            return updatedItems.slice(0, 3);
        });
    };

    return {
        items,
        addItem,
    };
};
