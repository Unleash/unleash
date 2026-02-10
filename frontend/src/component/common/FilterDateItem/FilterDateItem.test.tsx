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
) => {
    const recordedChanges: FilterItemParams[] = [];

    const mockProps: IFilterDateItemProps = {
        name,
        label,
        onChange: (value: FilterItemParams) => recordedChanges.push(value),
        operators: ['IS', 'IS_ON_OR_AFTER', 'IS_BEFORE'],
        onChipClose: () => {},
        state: initialState,
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

it('disables dates after today', async () => {
    setup(null, 'Test', 'Test');

    const chip = await screen.findByText('Test');
    await userEvent.click(chip);

    const tomorrow = addDays(new Date(), 1);
    const dayLabel = format(tomorrow, 'd');

    const tomorrowCell = await screen.findByRole('gridcell', {
        name: dayLabel,
    });

    expect(tomorrowCell.className).toMatch(/Mui-disabled/);
});
