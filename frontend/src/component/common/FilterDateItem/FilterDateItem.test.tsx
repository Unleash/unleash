import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import type { FilterItemParams } from 'component/filter/FilterItem/FilterItem';
import {
    FilterDateItem,
    type IFilterDateItemProps,
} from './FilterDateItem.tsx';

const getDate = async (option: string) => screen.findByText(option);

const setup = (
    initialState: FilterItemParams | null,
    allState?: Record<string, FilterItemParams | null>,
) => {
    const recordedChanges: FilterItemParams[] = [];

    const mockProps: IFilterDateItemProps = {
        name: 'Date To',
        label: 'Date To',
        onChange: (value: FilterItemParams) => {
            recordedChanges.push(value);
        },
        operators: ['IS', 'IS_AFTER', 'IS_ON_OR_AFTER', 'IS_BEFORE'],
        onChipClose: () => {},
        state: initialState,
        allState,
    };

    render(
        <FilterDateItem {...mockProps} fromFilterKey='from' toFilterKey='to' />,
    );

    return recordedChanges;
};

describe('FilterDateItem Component', () => {
    it('renders initial state correctly', async () => {
        const mockState = {
            operator: 'IS_ON_OR_AFTER',
            values: ['2015-01-21'],
        };

        const recordedChanges = setup(mockState);

        const valuesElement = await screen.findByText('01/21/2015');
        await screen.findByText('is on or after');
        expect(valuesElement).toBeInTheDocument();

        valuesElement.click();

        const selectedDate = await getDate('21');

        expect(selectedDate).toHaveAttribute('aria-selected', 'true');

        (await getDate('22')).click();

        expect(recordedChanges).toEqual([
            {
                operator: 'IS_ON_OR_AFTER',
                values: ['2015-01-22'],
            },
        ]);
    });

    it('renders initial popover when no existing value', async () => {
        const mockState = null;

        setup(mockState);

        const results = await screen.findAllByText('21');

        // In *most* cases, this will probably only be 1, but it *can*
        // be more if it's the right time of year (that is: if it
        // would also show "week 21").
        expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('switches operator', async () => {
        const mockState = {
            operator: 'IS_ON_OR_AFTER',
            values: ['2020-01-01'],
        };

        const recordedChanges = setup(mockState);

        const operatorsElement = await screen.findByText('is on or after');

        operatorsElement.click();
        const newOperator = await screen.findByText('is before');

        newOperator.click();

        expect(recordedChanges).toEqual([
            {
                operator: 'IS_BEFORE',
                values: ['2020-01-01'],
            },
        ]);
    });
});

describe('FilterDateItem date range constraints', () => {
    it('disables invalid dates in Date To based on Date From', async () => {
        const fromState: FilterItemParams = {
            operator: 'IS',
            values: ['2025-01-15'],
        };
        const toState: FilterItemParams = {
            operator: 'IS',
            values: ['2025-01-20'],
        };
        const allState = {
            from: fromState,
            to: toState,
        };

        const recordedChanges = setup(toState, allState);

        const dateToChip = await screen.findByTestId('FILTER_ITEM');
        await userEvent.click(dateToChip);

        const day10 = await screen.findByRole('gridcell', { name: '10' });
        expect(day10.className).toMatch(/Mui-disabled/);

        const day15 = await screen.findByRole('gridcell', { name: '15' });
        expect(day15).toBeDefined();
        expect(day15.className).not.toMatch(/Mui-disabled/);

        const day16 = await screen.findByRole('gridcell', { name: '16' });
        expect(day16).toBeDefined();
        await userEvent.click(day16!);

        expect(recordedChanges).toEqual([
            {
                operator: 'IS',
                values: ['2025-01-16'],
            },
        ]);
    });

    it('disables Date From dates after selected Date To', async () => {
        const fromState: FilterItemParams = {
            operator: 'IS',
            values: ['2025-01-16'],
        };
        const toState: FilterItemParams = {
            operator: 'IS',
            values: ['2025-01-14'],
        };
        const allState = {
            from: fromState,
            to: toState,
        };

        setup(toState, allState);

        await userEvent.click(await screen.findByText('Date To'));

        const disabledDate = await screen.findByRole('gridcell', {
            name: '15',
        });
        expect(disabledDate.className).toMatch(/Mui-disabled/);
    });

    it('allows selecting valid dates', async () => {
        const fromState: FilterItemParams = {
            operator: 'IS',
            values: ['2025-01-12'],
        };
        const toState: FilterItemParams = {
            operator: 'IS',
            values: ['2025-01-18'],
        };
        const allState = {
            from: fromState,
            to: toState,
        };

        const recordedChanges = setup(toState, allState);

        await userEvent.click(await screen.findByText('Date To'));

        const validDate = await screen.findByRole('gridcell', { name: '19' });

        await userEvent.click(validDate);

        expect(recordedChanges).toEqual([
            {
                operator: 'IS',
                values: ['2025-01-19'],
            },
        ]);
    });
});
