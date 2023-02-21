import { isValidField } from './import-context-validation';

test('has value context field', () => {
    expect(
        isValidField(
            { name: 'contextField', legalValues: [{ value: 'value1' }] },
            [{ name: 'contextField', legalValues: [{ value: 'value1' }] }],
        ),
    ).toBe(true);
});

test('no matching field value', () => {
    expect(
        isValidField(
            { name: 'contextField', legalValues: [{ value: 'value1' }] },
            [{ name: 'contextField', legalValues: [{ value: 'value2' }] }],
        ),
    ).toBe(false);
});

test('subset field value', () => {
    expect(
        isValidField(
            { name: 'contextField', legalValues: [{ value: 'value1' }] },
            [
                {
                    name: 'contextField',
                    legalValues: [{ value: 'value2' }, { value: 'value1' }],
                },
            ],
        ),
    ).toBe(true);
});
