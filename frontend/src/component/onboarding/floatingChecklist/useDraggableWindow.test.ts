import { act, renderHook } from '@testing-library/react';
import { useState, type RefObject } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import { useDraggableWindow } from './useDraggableWindow.ts';

interface Position {
    x: number;
    y: number;
}

interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

const makeDOMRect = (r: Rect): DOMRect =>
    ({
        left: r.left,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        x: r.left,
        y: r.top,
        width: r.right - r.left,
        height: r.bottom - r.top,
        toJSON: () => ({}),
    }) as DOMRect;

const attachElement = (
    ref: RefObject<HTMLElement | null>,
    natural: Rect,
    getTranslate: () => Position,
) => {
    const el = document.createElement('div');
    el.getBoundingClientRect = () => {
        const t = getTranslate();
        return makeDOMRect({
            left: natural.left + t.x,
            top: natural.top + t.y,
            right: natural.right + t.x,
            bottom: natural.bottom + t.y,
        });
    };
    document.body.appendChild(el);
    ref.current = el;
    return el;
};

const setViewport = (width: number, height: number) => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
        value: width,
        configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
        value: height,
        configurable: true,
    });
};

const flushRefresh = () => {
    act(() => {
        window.dispatchEvent(new Event('resize'));
    });
};

const drag = (
    onDrag: (event: DraggableEvent, data: DraggableData) => void,
    x: number,
    y: number,
) => {
    act(() => {
        onDrag({} as DraggableEvent, { x, y } as DraggableData);
    });
};

const renderDraggable = () =>
    renderHook(() => {
        const [position, setPosition] = useState<Position | null>(null);
        return useDraggableWindow({
            position,
            onPositionChange: setPosition,
        });
    });

class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal('ResizeObserver', NoopResizeObserver);

beforeEach(() => {
    setViewport(1000, 800);
});

afterEach(() => {
    document.body.innerHTML = '';
});

test('keeps a gap from every viewport edge', () => {
    const { result } = renderDraggable();
    attachElement(
        result.current.nodeRef,
        { left: 520, top: 376, right: 840, bottom: 776 },
        () => result.current.position,
    );

    flushRefresh();

    expect(result.current.bounds).toEqual({
        left: 24 - 520,
        right: 1000 - 24 - 840,
        top: 24 - 376,
        bottom: 800 - 24 - 776,
    });
    expect(result.current.canDrag).toBe(true);
});

test('disables dragging when the element fills the viewport', () => {
    const { result } = renderDraggable();
    attachElement(
        result.current.nodeRef,
        { left: 16, top: 24, right: 984, bottom: 776 },
        () => result.current.position,
    );

    flushRefresh();

    expect(result.current.bounds).toEqual({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    });
    expect(result.current.canDrag).toBe(false);
});

test('locks only the constrained axis when the other still has room', () => {
    const { result } = renderDraggable();
    attachElement(
        result.current.nodeRef,
        { left: 16, top: 200, right: 984, bottom: 400 },
        () => result.current.position,
    );

    flushRefresh();

    const bounds = result.current.bounds;
    expect(bounds?.left).toBe(bounds?.right);
    expect(bounds?.top).not.toBe(bounds?.bottom);
    expect(result.current.canDrag).toBe(true);
});

test('reports dragging only while a drag is in flight', () => {
    const { result } = renderDraggable();

    expect(result.current.dragging).toBe(false);

    act(() => result.current.onStart());
    expect(result.current.dragging).toBe(true);

    act(() => result.current.onStop());
    expect(result.current.dragging).toBe(false);
});

test('clips the dragged position back inside bounds when the viewport shrinks', () => {
    const { result } = renderDraggable();
    attachElement(
        result.current.nodeRef,
        { left: 400, top: 300, right: 720, bottom: 500 },
        () => result.current.position,
    );
    flushRefresh();
    drag(result.current.onDrag, 100, 100);
    expect(result.current.position).toEqual({ x: 100, y: 100 });

    setViewport(700, 500);
    flushRefresh();

    expect(result.current.position).toEqual({
        x: 700 - 24 - 720,
        y: 500 - 24 - 500,
    });
});
