import { validateParameterValue } from 'utils/validateParameterValue';

test('validateParameterValue string', () => {
    expect(
        validateParameterValue(
            { type: 'string', name: 'a', description: 'b', required: false },
            ''
        )
    ).toBeUndefined();
    expect(
        validateParameterValue(
            { type: 'string', name: 'a', description: 'b', required: false },
            'a'
        )
    ).toBeUndefined();
    expect(
        validateParameterValue(
            { type: 'string', name: 'a', description: 'b', required: true },
            ''
        )
    ).not.toBeUndefined();
    expect(
        validateParameterValue(
            { type: 'string', name: 'a', description: 'b', required: true },
            'b'
        )
    ).toBeUndefined();
});

test('validateParameterValue number', () => {
    expect(
        validateParameterValue(
            { type: 'number', name: 'a', description: 'b', required: false },
            ''
        )
    ).toBeUndefined();
    expect(
        validateParameterValue(
            { type: 'number', name: 'a', description: 'b', required: false },
            'a'
        )
    ).not.toBeUndefined();
    expect(
        validateParameterValue(
            { type: 'number', name: 'a', description: 'b', required: true },
            ''
        )
    ).not.toBeUndefined();
    expect(
        validateParameterValue(
            { type: 'number', name: 'a', description: 'b', required: true },
            '1'
        )
    ).toBeUndefined();
});
