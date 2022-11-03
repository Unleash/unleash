import { useRef, useEffect, RefObject } from 'react';
// TODO: Integrate with useDragItem and get rid of this.

export type MoveListItem = (
    dragIndex: number,
    dropIndex: number,
    save?: boolean
) => void;

export const useDragItemWithHandle = <T extends HTMLElement>(
    listItemIndex: number,
    moveListItem: MoveListItem,
    handle?: RefObject<HTMLElement>
): RefObject<T> => {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            if (!handle) {
                ref.current.draggable = true;
                ref.current.style.cursor = 'grab';
            }
            ref.current.dataset.index = String(listItemIndex);
            return addEventListeners(ref.current, moveListItem, handle);
        }
    }, [listItemIndex, moveListItem]);

    return ref;
};

const addEventListeners = (
    el: HTMLElement,
    moveListItem: MoveListItem,
    handle?: RefObject<HTMLElement>
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

    const onMouseEnter = (e: MouseEvent) => {
        if (e.target === handle?.current) {
            el.draggable = true;
        }
    };

    const onMouseLeave = () => {
        el.draggable = false;
    };

    const onDragStart = () => {
        el.draggable = true;
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

    handle?.current?.addEventListener('mouseenter', onMouseEnter);
    handle?.current?.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragenter', onDragEnter);
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);

    return () => {
        handle?.current?.removeEventListener('mouseenter', onMouseEnter);
        handle?.current?.removeEventListener('mouseleave', onMouseLeave);
        el.removeEventListener('dragstart', onDragStart);
        el.removeEventListener('dragenter', onDragEnter);
        el.removeEventListener('dragover', onDragOver);
        el.removeEventListener('drop', onDrop);
    };
};

// The element being dragged in the browser.
let globalDraggedElement: HTMLElement | null;
