import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorageState } from './useLocalStorageState.ts';
import { createLocalStorage } from '../utils/createLocalStorage.ts';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import { type FC, useState } from 'react';

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
});
