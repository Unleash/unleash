import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FilterItemParams } from 'component/filter/FilterItem/FilterItem';
import { FilterDateItem, IFilterDateItemProps } from './FilterDateItem';

const getDate = (option: string) => screen.getByText(option);

const setup = (initialState: FilterItemParams | null) => {
    const recordedChanges: FilterItemParams[] = [];
    const mockProps: IFilterDateItemProps = {
        name: 'Test Label',
        label: 'irrelevant',
        onChange: (value: FilterItemParams) => {
            recordedChanges.push(value);
        },
        onChipClose: () => {},
        operators: ['IS_ON_OR_AFTER', 'IS_BEFORE'],
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

        const selectedDate = getDate('21');

        expect(selectedDate).toHaveAttribute('aria-selected', 'true');

        getDate('22').click();

        expect(recordedChanges).toEqual([
            {
                operator: 'IS_ON_OR_AFTER',
                values: ['2015-01-22'],
            },
        ]);
    });

    it('renders initial popover when no existing value', async () => {
        const mockState = null;

        const recordedChanges = setup(mockState);

        await screen.findByText('21');
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
