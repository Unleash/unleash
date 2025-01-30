import { useRef, useEffect, type RefObject } from 'react';

export type OnMoveItem = (
    dragIndex: number,
    dropIndex: number,
    save?: boolean,
) => void;

// The element being dragged in the browser.
let globalDraggedElement: HTMLElement | null;

export const useDragItem = <T extends HTMLElement>(
    listItemIndex: number,
    onMoveItem: OnMoveItem,
    handle?: RefObject<HTMLElement>,
): RefObject<T> => {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.dataset.index = String(listItemIndex);
            return addEventListeners(
                ref.current,
                onMoveItem,
                handle?.current ?? undefined,
            );
        }
    }, [listItemIndex, onMoveItem]);

    return ref;
};

const addEventListeners = (
    el: HTMLElement,
    onMoveItem: OnMoveItem,
    handle?: HTMLElement,
): (() => void) => {
    const handleEl = handle ?? el;

    const moveDraggedElement = (save: boolean) => {
        if (globalDraggedElement) {
            const fromIndex = Number(globalDraggedElement.dataset.index);
            const toIndex = Number(el.dataset.index);
            onMoveItem(fromIndex, toIndex, save);
        }
    };

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

    const onDragEnd = () => {
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
    el.addEventListener('dragend', onDragEnd);

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
        el.removeEventListener('dragend', onDragEnd);
    };
};
