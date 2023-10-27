import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { SingleLegalValue } from './SingleLegalValue';

test('should show alert when you have illegal legal values', async () => {
    const contextDefinitionValues = [{ value: 'value1' }, { value: 'value2' }];
    const fixedValue = 'value1';
    const localValue = 'value1';
    const deletedLegalValues = [{ value: 'value1' }];

    render(
        <SingleLegalValue
            data={{ legalValues: contextDefinitionValues, deletedLegalValues }}
            constraintValue={fixedValue}
            value={localValue}
            setValue={() => {}}
            type='number'
            legalValues={contextDefinitionValues}
            error={''}
            setError={() => {}}
        />,
    );

    await screen.findByText(
        'This constraint is using legal values that have been deleted as a valid option. Please select a new value from the remaining predefined legal values. The constraint will be updated with the new value when you save the strategy.',
    );
});
