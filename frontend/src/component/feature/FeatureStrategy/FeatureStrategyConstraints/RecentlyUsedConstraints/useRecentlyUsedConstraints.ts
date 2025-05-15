import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { IConstraint } from 'interfaces/strategy';

const hashString = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }

    return Math.abs(hash);
};

export const getConstraintKey = (constraint: IConstraint): string => {
    const sortedValues = (values?: string[]) =>
        values ? [...values].sort() : undefined;

    const jsonString = JSON.stringify({
        contextName: constraint.contextName,
        operator: constraint.operator,
        values: sortedValues(constraint.values),
        value: constraint.value,
        inverted: constraint.inverted,
        caseInsensitive: constraint.caseInsensitive,
    });

    return hashString(jsonString).toString();
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
