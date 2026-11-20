import { renderHook, waitFor } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import {
    useKeyboardShortcut,
    useKeyboardShortcutLabel,
} from './useKeyboardShortcut.js';

const pressKey = (
    key: string,
    modifiers: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, ...modifiers }));
};

const refTo = (element: Element | null): RefObject<Element | null> => ({
    current: element,
});

afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

test('triggers the callback when the key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k' }, callback));

    pressKey('k');

    expect(callback).toHaveBeenCalledTimes(1);
});

test('without anchorRefs, still triggers while a dialog is open elsewhere', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k' }, callback));

    document.body.insertAdjacentHTML(
        'beforeend',
        '<div class="MuiBackdrop-root"></div>',
    );

    pressKey('k');

    expect(callback).toHaveBeenCalledTimes(1);
});

test('with anchorRefs, is suppressed once a dialog overlays the referenced element', () => {
    const trigger = document.createElement('button');
    const hiddenAncestor = document.createElement('div');
    hiddenAncestor.setAttribute('aria-hidden', 'true');
    hiddenAncestor.appendChild(trigger);
    document.body.appendChild(hiddenAncestor);
    document.body.insertAdjacentHTML(
        'beforeend',
        '<div class="MuiBackdrop-root"></div>',
    );

    const callback = vi.fn();
    renderHook(() =>
        useKeyboardShortcut(
            { key: 'k', anchorRefs: [refTo(trigger)] },
            callback,
        ),
    );

    pressKey('k');

    expect(callback).not.toHaveBeenCalled();
});

test('with anchorRefs, stays enabled while its own dialog (not hidden) is open', () => {
    const triggerButton = document.createElement('button');
    const hiddenAncestor = document.createElement('div');
    hiddenAncestor.setAttribute('aria-hidden', 'true');
    hiddenAncestor.appendChild(triggerButton);
    document.body.appendChild(hiddenAncestor);

    const ownDialogContent = document.createElement('div');
    document.body.appendChild(ownDialogContent);
    document.body.insertAdjacentHTML(
        'beforeend',
        '<div class="MuiBackdrop-root"></div>',
    );

    const callback = vi.fn();
    renderHook(() =>
        useKeyboardShortcut(
            {
                key: 'k',
                anchorRefs: [refTo(triggerButton), refTo(ownDialogContent)],
            },
            callback,
        ),
    );

    pressKey('k');

    expect(callback).toHaveBeenCalledTimes(1);
});

test('a shortcut with no modifiers does not fire when an unlisted modifier is held', () => {
    const plain = vi.fn();
    const shiftVariant = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k' }, plain));
    renderHook(() =>
        useKeyboardShortcut({ key: 'k', modifiers: ['shift'] }, shiftVariant),
    );

    pressKey('k', { shiftKey: true });

    expect(plain).not.toHaveBeenCalled();
    expect(shiftVariant).toHaveBeenCalledTimes(1);
});

test('a shortcut requiring one modifier does not fire when an extra modifier is also held', () => {
    const altOnly = vi.fn();
    const altShift = vi.fn();
    renderHook(() =>
        useKeyboardShortcut({ key: 'k', modifiers: ['alt'] }, altOnly),
    );
    renderHook(() =>
        useKeyboardShortcut(
            { key: 'k', modifiers: ['alt', 'shift'] },
            altShift,
        ),
    );

    pressKey('k', { altKey: true, shiftKey: true });

    expect(altOnly).not.toHaveBeenCalled();
    expect(altShift).toHaveBeenCalledTimes(1);
});

test('key matching is case-insensitive, since Shift can change event.key casing', () => {
    const callback = vi.fn();
    renderHook(() =>
        useKeyboardShortcut({ key: 'k', modifiers: ['shift'] }, callback),
    );

    pressKey('K', { shiftKey: true });

    expect(callback).toHaveBeenCalledTimes(1);
});

test('with anchorRefs, invisible backdrops (e.g. an open menu) do not suppress the shortcut', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    document.body.insertAdjacentHTML(
        'beforeend',
        '<div class="MuiBackdrop-root MuiBackdrop-invisible"></div>',
    );

    const callback = vi.fn();
    renderHook(() =>
        useKeyboardShortcut(
            { key: 'k', anchorRefs: [refTo(trigger)] },
            callback,
        ),
    );

    pressKey('k');

    expect(callback).toHaveBeenCalledTimes(1);
});

test('ignores keydown events without a key, such as those fired by browser autofill', () => {
    const errors: unknown[] = [];
    const recordError = (event: ErrorEvent) => errors.push(event.error);
    window.addEventListener('error', recordError);
    renderHook(() => useKeyboardShortcut({ key: 'k' }, () => {}));

    window.dispatchEvent(new Event('keydown'));
    window.removeEventListener('error', recordError);

    expect(errors).toEqual([]);
});

test('labels the shortcut with Ctrl outside Apple devices', () => {
    const { result } = renderHook(() =>
        useKeyboardShortcutLabel('k', ['ctrl', 'shift']),
    );

    expect(result.current).toBe('Ctrl+Shift+K');
});

test('labels the shortcut with ⌘ on Apple devices', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');

    const { result } = renderHook(() =>
        useKeyboardShortcutLabel('k', ['ctrl']),
    );

    await waitFor(() => expect(result.current).toBe('⌘+K'));
});
