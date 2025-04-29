import { useLocalStorageState } from 'hooks/useLocalStorageState';
import type { IConstraint } from 'interfaces/strategy';

export const areConstraintsEqual = (
    a: IConstraint,
    b: IConstraint,
): boolean => {
    const sortedValues = (values?: string[]) =>
        values ? [...values].sort() : undefined;

    const aJson = JSON.stringify({
        contextName: a.contextName,
        operator: a.operator,
        values: sortedValues(a.values),
        value: a.value,
        inverted: a.inverted,
        caseInsensitive: a.caseInsensitive,
    });

    const bJson = JSON.stringify({
        contextName: b.contextName,
        operator: b.operator,
        values: sortedValues(b.values),
        value: b.value,
        inverted: b.inverted,
        caseInsensitive: b.caseInsensitive,
    });

    return aJson === bJson;
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
                // Remove any existing items that are equal to the new item
                updatedItems = updatedItems.filter(
                    (existingItem) => !areConstraintsEqual(existingItem, item),
                );

                // Add the new item at the beginning
                updatedItems = [item, ...updatedItems];
            });

            // Limit to 3 items
            return updatedItems.slice(0, 3);
        });
    };

    return {
        items,
        addItem,
    };
};
