import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { RestrictiveLegalValues } from './RestrictiveLegalValues';

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
            error={''}
            setError={() => {}}
        />,
    );

    await screen.findByText(
        'This constraint is using legal values that have been deleted as valid options. If you save changes on this constraint and then save the strategy the following values will be removed:',
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
            error={''}
            setError={() => {}}
        />,
    );

    expect(localValues).toEqual(['value2']);
});
