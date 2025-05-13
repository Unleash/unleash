import { render } from 'utils/testRenderer';
import { fireEvent, screen } from '@testing-library/react';
import { RestrictiveLegalValues } from './RestrictiveLegalValues.tsx';
import { vi } from 'vitest';

vi.mock('../../../../../../hooks/useUiFlag', () => ({
    useUiFlag: vi.fn(
        (flag: string) => flag !== 'disableShowContextFieldSelectionValues',
    ),
}));

test('should show alert when you have illegal legal values', async () => {
    const contextDefinitionValues = [{ value: 'value1' }, { value: 'value2' }];
    const fixedValues = ['value1', 'value2'];
    const localValues = ['value1', 'value2'];
    const deletedLegalValues = [{ value: 'value1' }];

    render(
        <RestrictiveLegalValues
            data={{ legalValues: contextDefinitionValues, deletedLegalValues }}
            constraintValues={fixedValues}
            values={localValues}
            setValues={() => {}}
            setValuesWithRecord={() => {}}
            error={''}
            setError={() => {}}
        />,
    );

    await screen.findByText(
        'This constraint is currently using values that were valid in the past but have since been deleted. If you save changes on this constraint and then save the strategy the following values will be removed:',
    );
});

test('Should remove illegal legal values from internal value state when mounting', () => {
    const contextDefinitionValues = [{ value: 'value1' }, { value: 'value2' }];
    const fixedValues = ['value1', 'value2'];
    let localValues = ['value1', 'value2'];
    const deletedLegalValues = [{ value: 'value1' }];

    const setValues = (values: string[]) => {
        localValues = values;
    };

    render(
        <RestrictiveLegalValues
            data={{
                legalValues: contextDefinitionValues,
                deletedLegalValues,
            }}
            constraintValues={fixedValues}
            values={localValues}
            setValues={setValues}
            setValuesWithRecord={() => {}}
            error={''}
            setError={() => {}}
        />,
    );

    expect(localValues).toEqual(['value2']);
});

test('Should select all', async () => {
    const contextDefinitionValues = [{ value: 'value1' }, { value: 'value2' }];
    let localValues: string[] = [];

    const setValuesWithRecord = (values: string[]) => {
        localValues = values;
    };

    render(
        <RestrictiveLegalValues
            data={{
                legalValues: contextDefinitionValues,
                deletedLegalValues: [{ value: 'value3' }],
            }}
            constraintValues={[]}
            values={localValues}
            setValues={() => {}}
            setValuesWithRecord={setValuesWithRecord}
            error={''}
            setError={() => {}}
        />,
    );

    const selectedAllButton = await screen.findByText(/Select all/i);

    fireEvent.click(selectedAllButton);
    expect(localValues).toEqual(['value1', 'value2']);
});

test('Should unselect all', async () => {
    const contextDefinitionValues = [{ value: 'value1' }, { value: 'value2' }];
    let localValues: string[] = ['value1', 'value2'];

    const setValuesWithRecord = (values: string[]) => {
        localValues = values;
    };

    render(
        <RestrictiveLegalValues
            data={{
                legalValues: contextDefinitionValues,
                deletedLegalValues: [{ value: 'value3' }],
            }}
            constraintValues={[]}
            values={localValues}
            setValues={() => {}}
            setValuesWithRecord={setValuesWithRecord}
            error={''}
            setError={() => {}}
        />,
    );

    const selectedAllButton = await screen.findByText(/Unselect all/i);

    fireEvent.click(selectedAllButton);
    expect(localValues).toEqual([]);
});
