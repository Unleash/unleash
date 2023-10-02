import { cleanConstraint } from 'utils/cleanConstraint';

test('cleanConstraint values', () => {
    expect(
        cleanConstraint({
            contextName: '',
            operator: 'IN',
            value: '1',
            values: ['2'],
        })
    ).toEqual({
        contextName: '',
        operator: 'IN',
        values: ['2'],
    });
});

test('cleanConstraint value', () => {
    expect(
        cleanConstraint({
            contextName: '',
            operator: 'NUM_EQ',
            value: '1',
            values: ['2'],
        })
    ).toEqual({
        contextName: '',
        operator: 'NUM_EQ',
        value: '1',
    });
});
