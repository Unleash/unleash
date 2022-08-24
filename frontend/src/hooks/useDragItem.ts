import { useRef, useEffect, RefObject } from 'react';

export type MoveListItem = (
    dragIndex: number,
    dropIndex: number,
    save?: boolean
) => void;

export const useDragItem = (
    listItemIndex: number,
    moveListItem: MoveListItem
): RefObject<HTMLTableRowElement> => {
    const ref = useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.draggable = true;
            ref.current.style.cursor = 'grab';
            ref.current.dataset.index = String(listItemIndex);
            return addEventListeners(ref.current, moveListItem);
        }
    }, [listItemIndex, moveListItem]);

    return ref;
};

const addEventListeners = (
    el: HTMLTableRowElement,
    moveListItem: MoveListItem
): (() => void) => {
    const moveDraggedElement = (save: boolean) => {
        if (globalDraggedElement) {
            moveListItem(
                Number(globalDraggedElement.dataset.index),
                Number(el.dataset.index),
                save
            );
        }
    };

    const onDragStart = () => {
        globalDraggedElement = el;
    };

    const onDragEnter = () => {
        moveDraggedElement(false);
    };

    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
    };

    const onDrop = () => {
        moveDraggedElement(true);
        globalDraggedElement = null;
    };

    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragenter', onDragEnter);
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);

    return () => {
        el.removeEventListener('dragstart', onDragStart);
        el.removeEventListener('dragenter', onDragEnter);
        el.removeEventListener('dragover', onDragOver);
        el.removeEventListener('drop', onDrop);
    };
};

// The element being dragged in the browser.
let globalDraggedElement: HTMLTableRowElement | null;
