import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FILTER_ITEM } from 'utils/testIds';
import { Filters, IFilterItem } from './Filters';

test('shoulder render all available filters', async () => {
    const availableFilters: IFilterItem[] = [
        {
            label: 'Filter1',
            options: [],
            filterKey: 'project',
            singularOperators: ['IS', 'IS_NOT'],
            pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
        },
        {
            label: 'Filter2',
            options: [],
            filterKey: 'project',
            singularOperators: ['IS', 'IS_NOT'],
            pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
        },
        {
            label: 'Filter3',
            options: [],
            filterKey: 'project',
            singularOperators: ['IS', 'IS_NOT'],
            pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
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
            options: [],
            filterKey: 'state',
            singularOperators: ['IS', 'IS_NOT'],
            pluralOperators: ['IS_ANY_OF', 'IS_NONE_OF'],
        },
        {
            label: 'Tags',
            options: [],
            filterKey: 'tag',
            singularOperators: ['INCLUDE', 'DO_NOT_INCLUDE'],
            pluralOperators: [
                'INCLUDE_ALL_OF',
                'INCLUDE_ANY_OF',
                'EXCLUDE_IF_ANY_OF',
                'EXCLUDE_ALL',
            ],
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
