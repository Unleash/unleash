import { render } from 'utils/testRenderer';
import { RestrictiveLegalValues } from './RestrictiveLegalValues';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

describe('RestictiveLegalValues', () => {
    it('should show deleted legal values as disabled', async () => {
        const value = 'some-value';
        const values = [{ value }];
        const legalValues = [{ value: 'some-other-value' }];

        render(
            <RestrictiveLegalValues
                data={{ legalValues, deletedLegalValues: values }}
                values={[value]}
                setValues={vi.fn()}
                error={''}
                setError={vi.fn()}
            />
        );

        const input = await screen.findByDisplayValue('some-value');

        expect(input).toBeInTheDocument();
        expect(input).toHaveProperty('disabled', true);

        expect(
            await screen.findByDisplayValue('some-other-value')
        ).toBeInTheDocument();
    });

    it('should remove deleted legal values when editing values', async () => {
        const value = 'some-value';
        const deletedLegalValues = [{ value }];
        const legalValues = [
            { value: 'some-other-value' },
            { value: 'value2' },
        ];
        const setValues = vi.fn();
        render(
            <RestrictiveLegalValues
                data={{ legalValues, deletedLegalValues }}
                values={[value, 'value2']}
                setValues={setValues}
                error={''}
                setError={vi.fn()}
            />
        );
        const btn = await screen.findByDisplayValue('some-other-value');
        btn.click();

        expect(setValues).toHaveBeenCalledWith(['value2', 'some-other-value']);
    });
});
