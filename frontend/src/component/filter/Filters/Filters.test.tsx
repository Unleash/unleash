import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FILTER_ITEM, FILTERS_MENU } from 'utils/testIds';
import { vi } from 'vitest';
import {
    type FilterItemParamHolder,
    Filters,
    type IFilterItem,
    type IDateFilterItem,
} from './Filters.tsx';

test('shoulder render all available filters', async () => {
    const availableFilters: IFilterItem[] = [
        {
            label: 'Filter1',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
        {
            label: 'Filter2',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
        {
            label: 'Filter3',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
    ];

    render(
        <Filters
            availableFilters={availableFilters}
            onChange={() => {}}
            state={{}}
        />,
    );

    await screen.findByText('Filter1');
    await screen.findByText('Filter2');
    await screen.findByText('Filter3');
});

test('should keep filters order when adding a new filter', async () => {
    const availableFilters: IFilterItem[] = [
        {
            label: 'State',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
        {
            label: 'Tags',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
    ];

    render(
        <Filters
            availableFilters={availableFilters}
            onChange={() => {}}
            state={{}}
        />,
    );

    const valuesElement = await screen.findByText('Tags');
    expect(valuesElement).toBeInTheDocument();
    valuesElement.click();

    const stateElement = await screen.findByText('State');
    expect(stateElement).toBeInTheDocument();

    fireEvent.click(stateElement);

    const filterItems = await screen.findAllByTestId(FILTER_ITEM);
    const filterTexts = filterItems.map((item) => item.textContent);

    expect(filterTexts).toEqual(['Tags', 'State']);
});

test('should remove selected item from the add filter list', async () => {
    const availableFilters: IFilterItem[] = [
        {
            label: 'State',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
        {
            label: 'Tags',
            icon: '',
            options: [],
            filterKey: 'irrelevantKey',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
    ];

    render(
        <Filters
            availableFilters={availableFilters}
            onChange={() => {}}
            state={{}}
        />,
    );

    // initial selection list
    const addFilterButton = await screen.findByText('Add filter');
    fireEvent.click(addFilterButton);
    expect((await screen.findByTestId(FILTERS_MENU)).textContent).toBe(
        'StateTags',
    );

    (await screen.findByText('State')).click();

    // reduced selection list
    fireEvent.click(addFilterButton);
    expect((await screen.findByTestId(FILTERS_MENU)).textContent).toBe('Tags');
});

test('should render filters in the order defined by the initial state', async () => {
    const initialState: FilterItemParamHolder = {
        filterB: { operator: '', values: [] },
        filterA: { operator: '', values: [] },
        filterC: { operator: '', values: [] },
    };

    const availableFilters: IFilterItem[] = [
        {
            label: 'FilterA',
            icon: '',
            options: [],
            filterKey: 'filterA',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
        {
            label: 'FilterB',
            icon: '',
            options: [],
            filterKey: 'filterB',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
        {
            label: 'FilterC',
            icon: '',
            options: [],
            filterKey: 'filterC',
            singularOperators: ['IRRELEVANT'],
            pluralOperators: ['IRRELEVANT'],
        },
    ];

    render(
        <Filters
            availableFilters={availableFilters}
            onChange={() => {}}
            state={initialState}
        />,
    );

    const filterItems = screen.getAllByTestId(FILTER_ITEM);
    const filterTexts = filterItems.map((item) => item.textContent);

    expect(filterTexts).toEqual(['FilterB', 'FilterA', 'FilterC']);
});

describe('Date range auto-adjustment', () => {
    test('auto-adjusts to-date when from-date exceeds it', async () => {
        const onChange = vi.fn();
        const initialState: FilterItemParamHolder = {
            from: { operator: 'IS', values: ['2025-01-10'] },
            to: { operator: 'IS', values: ['2025-01-15'] },
        };

        const dateFilters: IDateFilterItem[] = [
            {
                label: 'Date From',
                icon: 'today',
                options: [],
                filterKey: 'from',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
            },
            {
                label: 'Date To',
                icon: 'today',
                options: [],
                filterKey: 'to',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
            },
        ];

        render(
            <Filters
                availableFilters={dateFilters}
                onChange={onChange}
                state={initialState}
            />,
        );

        const dateFromChip = await screen.findByText('Date From');
        fireEvent.click(dateFromChip);

        const day20 = await screen.findByRole('gridcell', { name: '20' });
        fireEvent.click(day20);

        expect(onChange).toHaveBeenCalledWith({
            from: { operator: 'IS', values: ['2025-01-20'] },
            to: { operator: 'IS', values: ['2025-01-20'] },
        });
    });

    test('auto-adjusts from-date when to-date is before it', async () => {
        const onChange = vi.fn();
        const initialState: FilterItemParamHolder = {
            from: { operator: 'IS', values: ['2025-01-15'] },
            to: { operator: 'IS', values: ['2025-01-20'] },
        };

        const dateFilters: IDateFilterItem[] = [
            {
                label: 'Date From',
                icon: 'today',
                options: [],
                filterKey: 'from',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
            },
            {
                label: 'Date To',
                icon: 'today',
                options: [],
                filterKey: 'to',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
            },
        ];

        render(
            <Filters
                availableFilters={dateFilters}
                onChange={onChange}
                state={initialState}
            />,
        );

        const dateToChip = await screen.findByText('Date To');
        fireEvent.click(dateToChip);

        const day10 = await screen.findByRole('gridcell', { name: '10' });
        fireEvent.click(day10);

        expect(onChange).toHaveBeenCalledWith({
            from: { operator: 'IS', values: ['2025-01-10'] },
            to: { operator: 'IS', values: ['2025-01-10'] },
        });
    });

    test('does not auto-adjust when date is within valid range', async () => {
        const onChange = vi.fn();
        const initialState: FilterItemParamHolder = {
            from: { operator: 'IS', values: ['2025-01-10'] },
            to: { operator: 'IS', values: ['2025-01-20'] },
        };

        const dateFilters: IDateFilterItem[] = [
            {
                label: 'Date From',
                icon: 'today',
                options: [],
                filterKey: 'from',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
            },
            {
                label: 'Date To',
                icon: 'today',
                options: [],
                filterKey: 'to',
                dateOperators: ['IS'],
                fromFilterKey: 'from',
                toFilterKey: 'to',
                persistent: true,
            },
        ];

        render(
            <Filters
                availableFilters={dateFilters}
                onChange={onChange}
                state={initialState}
            />,
        );

        const dateFromChip = await screen.findByText('Date From');
        fireEvent.click(dateFromChip);

        const day12 = await screen.findByRole('gridcell', { name: '12' });
        fireEvent.click(day12);

        expect(onChange).toHaveBeenCalledWith({
            from: { operator: 'IS', values: ['2025-01-12'] },
            to: { operator: 'IS', values: ['2025-01-20'] },
        });
    });
});
