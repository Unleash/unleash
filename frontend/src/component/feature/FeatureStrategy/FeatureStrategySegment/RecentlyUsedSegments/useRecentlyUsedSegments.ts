import { useLocalStorageState } from 'hooks/useLocalStorageState';

export const useRecentlyUsedSegments = (initialItems: number[] = []) => {
    const [items, setItems] = useLocalStorageState<number[]>(
        'recently-used-segments',
        initialItems,
    );

    const addItem = (newItem: number | number[]) => {
        setItems((prevItems) => {
            const itemsToAdd = Array.isArray(newItem) ? newItem : [newItem];

            let updatedItems = [...prevItems];
            itemsToAdd.forEach((id) => {
                updatedItems = updatedItems.filter(
                    (existingId) => existingId !== id,
                );
                updatedItems = [id, ...updatedItems];
            });
            return updatedItems.slice(0, 3);
        });
    };

    return {
        items,
        addItem,
    };
};
