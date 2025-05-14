import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { IConstraint } from 'interfaces/strategy';
import murmurHash3 from 'murmurhash3js';

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

    return murmurHash3.x86.hash32(jsonString).toString(16);
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
