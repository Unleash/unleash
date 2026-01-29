import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import type { FilterItemParams } from 'component/filter/FilterItem/FilterItem';
import {
    FilterDateItem,
    type IFilterDateItemProps,
} from './FilterDateItem.tsx';
import { addDays, format } from 'date-fns';

const getDate = async (option: string) => screen.findByText(option);

const setup = (
    initialState: FilterItemParams | null,
    name = 'Test Label',
    label = 'irrelevant',
    minDate?: Date,
    maxDate?: Date,
    dateConstraintsEnabled = true,
) => {
    const recordedChanges: FilterItemParams[] = [];

    const mockProps: IFilterDateItemProps = {
        name,
        label,
        onChange: (value: FilterItemParams) => recordedChanges.push(value),
        operators: ['IS', 'IS_ON_OR_AFTER', 'IS_BEFORE'],
        onChipClose: () => {},
        state: initialState,
        dateConstraintsEnabled,
        minDate,
        maxDate,
    };

    render(<FilterDateItem {...mockProps} />);
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
    it('disables dates before minDate', async () => {
        const min = new Date('2025-01-15');
        const max = new Date('2025-01-20');
        const recordedChanges = setup(
            { operator: 'IS', values: ['2025-01-16'] },
            'Test',
            'Test',
            min,
            max,
        );

        const chip = await screen.findByText('Test');
        await userEvent.click(chip);

        const day10 = await screen.findByRole('gridcell', { name: '10' });
        expect(day10.className).toMatch(/Mui-disabled/);

        const day15 = await screen.findByRole('gridcell', { name: '15' });
        expect(day15).toBeDefined();
        expect(day15.className).not.toMatch(/Mui-disabled/);

        const day16 = await screen.findByRole('gridcell', { name: '16' });
        expect(day16.className).not.toMatch(/Mui-disabled/);
        await userEvent.click(day16!);

        expect(recordedChanges).toEqual([
            {
                operator: 'IS',
                values: ['2025-01-16'],
            },
        ]);
    });

    it('disables dates after maxDate', async () => {
        const min = new Date('2025-01-10');
        const max = new Date('2025-01-14');
        const recordedChanges = setup(
            { operator: 'IS', values: ['2025-01-12'] },
            'Test',
            'Test',
            min,
            max,
        );

        const chip = await screen.findByText('Test');
        await userEvent.click(chip);

        const day15 = await screen.findByRole('gridcell', { name: '15' });
        expect(day15.className).toMatch(/Mui-disabled/);

        const day12 = await screen.findByRole('gridcell', { name: '12' });
        expect(day12.className).not.toMatch(/Mui-disabled/);
        await userEvent.click(day12!);

        expect(recordedChanges).toEqual([
            { operator: 'IS', values: ['2025-01-12'] },
        ]);
    });

    it('can disable dates after today', async () => {
        setup(null, 'Test', 'Test', undefined, new Date());

        const chip = await screen.findByText('Test');
        await userEvent.click(chip);

        const tomorrow = addDays(new Date(), 1);
        const dayLabel = format(tomorrow, 'd');

        const tomorrowCell = await screen.findByRole('gridcell', {
            name: dayLabel,
        });

        expect(tomorrowCell.className).toMatch(/Mui-disabled/);
    });

    it('allows selecting valid dates within min/max', async () => {
        const min = new Date('2025-01-12');
        const max = new Date('2025-01-18');

        const recordedChanges = setup(
            { operator: 'IS', values: ['2025-01-12'] },
            'Test',
            'Test',
            min,
            max,
        );

        const chip = await screen.findByText('Test');
        await userEvent.click(chip);

        const validDate = await screen.findByRole('gridcell', { name: '15' });
        await userEvent.click(validDate);

        expect(recordedChanges).toEqual([
            { operator: 'IS', values: ['2025-01-15'] },
        ]);
    });
});
