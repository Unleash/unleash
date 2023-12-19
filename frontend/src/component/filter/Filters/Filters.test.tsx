import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FILTER_ITEM } from 'utils/testIds';
import { FilterItemParamHolder, Filters, IFilterItem } from './Filters';

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

    stateElement.click();

    const filterItems = screen.getAllByTestId(FILTER_ITEM);
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
    const addFilterButton = screen.getByText('Add Filter');
    addFilterButton.click();
    expect(screen.getByRole('menu').textContent).toBe('StateTags');

    screen.getByText('State').click();

    // reduced selection list
    addFilterButton.click();
    expect(screen.getByRole('menu').textContent).toBe('Tags');
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
