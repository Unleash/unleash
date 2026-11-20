import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorageState } from './useLocalStorageState.ts';
import { createLocalStorage } from '../utils/createLocalStorage.ts';
import { render } from 'utils/testRenderer';
import {
    act,
    render as renderPlain,
    renderHook,
    screen,
    waitFor,
} from '@testing-library/react';
import { type FC, StrictMode, useEffect, useRef, useState } from 'react';

const TestComponent: FC<{
    keyName: string;
    initialValue: any;
}> = ({ keyName, initialValue }) => {
    const [value, setValue] = useLocalStorageState(keyName, initialValue);

    return (
        <div>
            <span data-testid='storedValue'>{value}</span>
            <button
                type='submit'
                onClick={() => setValue('updatedValue')}
                data-testid='updateButton'
            />
        </div>
    );
};

const DifferentComponentOnSameKey = ({ keyName }: { keyName: string }) => {
    useLocalStorageState(keyName, 'initialValue');
    const [renders, setRenders] = useState(1);

    return (
        <button
            type='button'
            onClick={() => setRenders((count) => count + 1)}
            data-testid='rerenderButton'
        >
            rendered {renders} times
        </button>
    );
};

describe('useLocalStorageState', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with the initial value if local storage is empty', () => {
        render(<TestComponent keyName='testKey' initialValue='initialValue' />);

        expect(screen.getByTestId('storedValue').textContent).toBe(
            'initialValue',
        );
    });

    it('updates the local storage and state when value changes', async () => {
        render(<TestComponent keyName='testKey' initialValue='initialValue' />);

        screen.getByTestId('updateButton').click();

        expect((await screen.findByTestId('storedValue')).textContent).toBe(
            'updatedValue',
        );
        await waitFor(() => {
            const { value } = createLocalStorage('testKey', {});
            expect(value).toStrictEqual('updatedValue');
        });
    });

    it('initializes with the value from local storage if available', async () => {
        createLocalStorage('testKey', {}).setValue('storedValue');

        render(<TestComponent keyName='testKey' initialValue='initialValue' />);

        expect(screen.getByTestId('storedValue').textContent).toBe(
            'storedValue',
        );
    });

    it('keeps a stored value when another component on the same key re-renders for its own reasons', async () => {
        render(
            <>
                <TestComponent keyName='testKey' initialValue='initialValue' />
                <DifferentComponentOnSameKey keyName='testKey' />
            </>,
        );

        screen.getByTestId('updateButton').click();
        await waitFor(() => {
            expect(createLocalStorage('testKey', {}).value).toBe(
                'updatedValue',
            );
        });

        screen.getByTestId('rerenderButton').click();
        await screen.findByText('rendered 2 times');

        expect(createLocalStorage('testKey', {}).value).toBe('updatedValue');
    });

    it('applies functional updates to the latest stored value across hook instances', () => {
        const { result: first } = renderHook(() =>
            useLocalStorageState<string[]>('sharedKey', []),
        );
        const { result: second } = renderHook(() =>
            useLocalStorageState<string[]>('sharedKey', []),
        );

        act(() => first.current[1]((items) => [...items, 'first']));
        act(() => second.current[1]((items) => [...items, 'second']));

        expect(second.current[0]).toEqual(['first', 'second']);
        expect(createLocalStorage('sharedKey', []).value).toEqual([
            'first',
            'second',
        ]);
    });

    it('evaluates a functional update once and stores the same result it renders', () => {
        const { result } = renderHook(() =>
            useLocalStorageState<string[]>('testKey', []),
        );
        let calls = 0;

        act(() =>
            result.current[1]((items) => {
                calls += 1;
                return [...items, String(calls)];
            }),
        );

        expect(calls).toBe(1);
        expect(result.current[0]).toEqual(['1']);
        expect(createLocalStorage('testKey', []).value).toEqual(['1']);
    });

    it('retains both updates when consumers update together in reverse mount order', () => {
        const { result } = renderHook(
            () =>
                [
                    useLocalStorageState<string[]>('sharedKey', []),
                    useLocalStorageState<string[]>('sharedKey', []),
                ] as const,
        );

        act(() => {
            result.current[1][1]((items) => [...items, 'second']);
            result.current[0][1]((items) => [...items, 'first']);
        });

        expect(result.current[0][0]).toEqual(['second', 'first']);
        expect(createLocalStorage('sharedKey', []).value).toEqual([
            'second',
            'first',
        ]);
    });

    it('retains sequential updates when the browser denies storage access', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new DOMException('Storage denied', 'SecurityError');
        });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('Storage denied', 'SecurityError');
        });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { result } = renderHook(() =>
            useLocalStorageState<string[]>('testKey', []),
        );

        act(() => {
            result.current[1]((items) => [...items, 'first']);
            result.current[1]((items) => [...items, 'second']);
        });

        expect(result.current[0]).toEqual(['first', 'second']);
    });

    it('retains sequential updates when reads work but storage quota prevents writes', () => {
        createLocalStorage<string[]>('testKey', []).setValue([]);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('Storage full', 'QuotaExceededError');
        });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { result } = renderHook(() =>
            useLocalStorageState<string[]>('testKey', []),
        );

        act(() => result.current[1]((items) => [...items, 'first']));
        act(() => result.current[1]((items) => [...items, 'second']));

        expect(result.current[0]).toEqual(['first', 'second']);
    });

    it('persists unsaved local updates when storage becomes writable again', () => {
        const { result } = renderHook(() =>
            useLocalStorageState<string[]>('testKey', []),
        );
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
            throw new DOMException('Storage full', 'QuotaExceededError');
        });

        act(() => result.current[1]((items) => [...items, 'unsaved']));
        act(() => result.current[1]((items) => [...items, 'recovered']));

        expect(result.current[0]).toEqual(['unsaved', 'recovered']);
        expect(createLocalStorage<string[]>('testKey', []).value).toEqual([
            'unsaved',
            'recovered',
        ]);
    });

    it('preserves standalone setter behavior after a failed write', () => {
        const store = createLocalStorage<string[]>('testKey', []);
        store.setValue(['saved']);
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
            throw new DOMException('Storage full', 'QuotaExceededError');
        });

        store.setValue((items) => [...items, 'unsaved']);
        store.setValue((items) => [...items, 'recovered']);

        expect(createLocalStorage<string[]>('testKey', []).value).toEqual([
            'saved',
            'recovered',
        ]);
    });

    it.each([
        false,
        true,
    ])('preserves child mount updates with StrictMode=%s', (strict) => {
        const Child = ({ update }: { update: () => void }) => {
            const onMount = useRef(update);
            useEffect(() => onMount.current(), []);
            return null;
        };
        const Parent = () => {
            const [value, setValue] = useLocalStorageState<string[]>(
                'testKey',
                [],
            );
            return (
                <>
                    <span data-testid='childValue'>{value.join(',')}</span>
                    <Child
                        update={() => setValue((items) => [...items, 'child'])}
                    />
                </>
            );
        };

        renderPlain(
            strict ? (
                <StrictMode>
                    <Parent />
                </StrictMode>
            ) : (
                <Parent />
            ),
        );

        const expected = strict ? ['child', 'child'] : ['child'];
        expect(screen.getByTestId('childValue').textContent).toBe(
            expected.join(','),
        );
        expect(createLocalStorage<string[]>('testKey', []).value).toEqual(
            expected,
        );
    });
});
