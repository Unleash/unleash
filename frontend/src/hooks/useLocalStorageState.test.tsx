import { useLocalStorageState } from './useLocalStorageState.ts';
import { createLocalStorage } from '../utils/createLocalStorage.ts';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import type { FC } from 'react';

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
});
