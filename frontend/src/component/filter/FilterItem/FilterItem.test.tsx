import { describe, expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import {
    FilterItem,
    type FilterItemParams,
    type IFilterItemProps,
} from './FilterItem.tsx';

const getOption = (option: string) => {
    const li = screen
        .getAllByText(option)
        .map((el) => el.closest('li'))
        .find((el): el is HTMLLIElement => el !== null)!;
    return li.querySelector('input')!;
};

const defaultOptions = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
];

const setup = (
    initialState: FilterItemParams | null,
    options: IFilterItemProps['options'] = defaultOptions,
    initMode?: IFilterItemProps['initMode'],
) => {
    const recordedChanges: FilterItemParams[] = [];
    const mockProps: IFilterItemProps = {
        name: 'Test Label',
        label: 'irrelevant',
        options,
        onChange: (value: FilterItemParams) => {
            recordedChanges.push(value);
        },
        onChipClose: () => {},
        singularOperators: ['IS', 'IS_NOT'],
        pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
        state: initialState,
        initMode,
    };

    render(<FilterItem {...mockProps} />);

    return recordedChanges;
};

describe('FilterItem Component', () => {
    it('renders initial state correctly', async () => {
        const mockState = {
            operator: 'IS_ANY_OF',
            values: ['1', '3'],
        };

        const recordedChanges = setup(mockState);

        const valuesElement = await screen.findByText('Option 1, Option 3');
        await screen.findByText('is any of');
        expect(valuesElement).toBeInTheDocument();

        valuesElement.click();
        await screen.findByPlaceholderText('Search');

        expect(getOption('Option 1').checked).toBe(true);
        expect(getOption('Option 2').checked).toBe(false);
        expect(getOption('Option 3').checked).toBe(true);

        getOption('Option 2').click();

        expect(recordedChanges).toEqual([
            {
                operator: 'IS_ANY_OF',
                values: ['1', '3', '2'],
            },
        ]);
    });

    it('renders initial popover when no existing value', async () => {
        const mockState = null;

        const _recordedChanges = setup(mockState);

        await screen.findByPlaceholderText('Search');
    });

    it('renders explicit and extra options', async () => {
        const mockState = {
            operator: 'IS_ANY_OF',
            values: ['1', '3', '2'],
        };

        const _recordedChanges = setup(mockState);

        const valuesElement = await screen.findByText('Option 1, Option 3 +1');
        await screen.findByText('is any of');
        expect(valuesElement).toBeInTheDocument();
    });

    it('adjusts operator to match singular item', async () => {
        const mockState = {
            operator: 'IS_ANY_OF',
            values: ['1'],
        };

        const recordedChanges = setup(mockState);

        expect(recordedChanges).toEqual([
            {
                operator: 'IS',
                values: ['1'],
            },
        ]);
    });

    it('adjusts operator to match plural items', async () => {
        const mockState = {
            operator: 'IS',
            values: ['1', '2'],
        };

        const recordedChanges = setup(mockState);

        expect(recordedChanges).toEqual([
            {
                operator: 'IS_ANY_OF',
                values: ['1', '2'],
            },
        ]);
    });

    it('switches operator', async () => {
        const mockState = {
            operator: 'IS_ANY_OF',
            values: ['1', '3'],
        };

        const recordedChanges = setup(mockState);

        const operatorsElement = await screen.findByText('is any of');

        operatorsElement.click();
        const newOperator = await screen.findByText('is none of');

        newOperator.click();

        expect(recordedChanges).toEqual([
            {
                operator: 'IS_NONE_OF',
                values: ['1', '3'],
            },
        ]);
    });

    it('deletes all values', async () => {
        const mockState = {
            operator: 'IS_ANY_OF',
            values: ['1', '3'],
        };

        const recordedChanges = setup(mockState);

        const deleteElement = await screen.findByLabelText('delete');

        deleteElement.click();

        expect(recordedChanges).toEqual([
            {
                operator: 'IS',
                values: [],
            },
        ]);
    });

    it('navigates between items with arrow keys', async () => {
        setup(null);

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

        const firstOption = screen.getByText('Option 1').closest('li')!;
        expect(document.activeElement).toBe(firstOption);

        fireEvent.keyDown(firstOption, { key: 'ArrowUp' });
        expect(document.activeElement).toBe(searchInput);
    });

    it('selects an item with the Enter key', async () => {
        const recordedChanges = setup(null);

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

        const firstOption = screen.getByText('Option 1').closest('li')!;
        fireEvent.keyDown(firstOption, { key: 'Enter' });

        expect(recordedChanges).toContainEqual({
            operator: 'IS',
            values: ['1'],
        });
    });

    it('filters options case-insensitively', async () => {
        setup(null);

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'OPTION 3' } });

        expect(screen.getByText('Option 3')).toBeInTheDocument();
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('selects the top filtered option on Enter from the search field', async () => {
        const recordedChanges = setup(null);

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'Option 3' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        expect(recordedChanges).toContainEqual({
            operator: 'IS',
            values: ['3'],
        });
    });

    it('does not select anything on Enter when search matches nothing', async () => {
        const recordedChanges = setup(null);

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'no-match' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        expect(recordedChanges).toEqual([]);
    });

    it('deselects an already-selected option when clicked', async () => {
        const recordedChanges = setup({
            operator: 'IS',
            values: ['2'],
        });

        const valuesElement = await screen.findByText('Option 2');
        valuesElement.click();
        await screen.findByPlaceholderText('Search');

        getOption('Option 2').click();

        expect(recordedChanges).toContainEqual({
            operator: 'IS',
            values: [],
        });
    });

    it('reflects the selected checkboxes for the currently visible filtered options', async () => {
        setup({
            operator: 'IS_ANY_OF',
            values: ['1', '3'],
        });

        (await screen.findByText('Option 1, Option 3')).click();

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'Option 3' } });

        expect(getOption('Option 3').checked).toBe(true);
    });

    it('does not auto-open when initMode is manual', () => {
        setup(null, defaultOptions, 'manual');

        expect(screen.queryByPlaceholderText('Search')).not.toBeInTheDocument();
    });

    it('unmounted options show up when searched', async () => {
        const manyOptions = Array.from({ length: 500 }, (_, i) => ({
            label: `Item ${i + 1}`,
            value: String(i + 1),
        }));

        const recordedChanges = setup(null, manyOptions);

        const searchInput = await screen.findByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'Item 250' } });
        fireEvent.keyDown(searchInput, { key: 'Enter' });

        expect(recordedChanges).toContainEqual({
            operator: 'IS',
            values: ['250'],
        });
    });
});
