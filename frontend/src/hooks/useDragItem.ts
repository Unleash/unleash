import { useRef, useEffect, RefObject } from 'react';

export type MoveListItem = (
    dragIndex: number,
    dropIndex: number,
    save?: boolean
) => void;

export const useDragItem = <T extends HTMLElement>(
    listItemIndex: number,
    moveListItem: MoveListItem,
    handle?: RefObject<HTMLElement>
): RefObject<T> => {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.dataset.index = String(listItemIndex);
            return addEventListeners(
                ref.current,
                moveListItem,
                handle?.current ?? undefined
            );
        }
    }, [listItemIndex, moveListItem]);

    return ref;
};

const addEventListeners = (
    el: HTMLElement,
    moveListItem: MoveListItem,
    handle?: HTMLElement
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

    const handleEl = handle ?? el;

    const onMouseEnter = (e: MouseEvent) => {
        if (e.target === handleEl) {
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

    handleEl.addEventListener('mouseenter', onMouseEnter);
    handleEl.addEventListener('mouseleave', onMouseLeave);
    if (handle) {
        el.addEventListener('mouseenter', onMouseLeave);
    }
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragenter', onDragEnter);
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);

    return () => {
        handleEl.removeEventListener('mouseenter', onMouseEnter);
        handleEl.removeEventListener('mouseleave', onMouseLeave);
        if (handle) {
            el.removeEventListener('mouseenter', onMouseLeave);
        }
        el.removeEventListener('dragstart', onDragStart);
        el.removeEventListener('dragenter', onDragEnter);
        el.removeEventListener('dragover', onDragOver);
        el.removeEventListener('drop', onDrop);
    };
};

// The element being dragged in the browser.
let globalDraggedElement: HTMLElement | null;
