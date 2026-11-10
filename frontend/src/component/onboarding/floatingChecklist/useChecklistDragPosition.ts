import { useCallback, useState } from 'react';

interface Position {
    x: number;
    y: number;
}

// Outlives the MainLayout remount on route change.
let persisted: Position | null = null;

export const useChecklistDragPosition = (): [
    Position | null,
    (position: Position) => void,
] => {
    const [position, setPosition] = useState<Position | null>(persisted);
    const update = useCallback((next: Position) => {
        persisted = next;
        setPosition(next);
    }, []);
    return [position, update];
};
