import type { IConstraint } from 'interfaces/strategy';
import { serializeConstraint } from './api-payload-constraint-replacer.ts';
import { constraintId } from 'constants/constraintId';

test('keys are ordered in the expected order', () => {
    const input: IConstraint = {
        values: ['something'],
        inverted: true,
        operator: 'STR_CONTAINS',
        contextName: 'context',
        caseInsensitive: true,
    };

    const output = serializeConstraint(input);

    expect(Object.entries(output)).toStrictEqual([
        ['contextName', 'context'],
        ['operator', 'STR_CONTAINS'],
        ['values', ['something']],
        ['caseInsensitive', true],
        ['inverted', true],
    ]);
});

test('only value OR values is present, not both', () => {
    const input: IConstraint = {
        value: 'something',
        values: ['something else'],
        inverted: true,
        operator: 'IN',
        contextName: 'context',
        caseInsensitive: true,
    };

    const noValue = serializeConstraint(input);
    expect(noValue.values).toStrictEqual(['something else']);
    expect(noValue).not.toHaveProperty('value');

    const noValues = serializeConstraint({
        ...input,
        operator: 'SEMVER_EQ',
    });
    expect(noValues.value).toStrictEqual('something');
    expect(noValues).not.toHaveProperty('values');
});

test('constraint id is not included', () => {
    const input: IConstraint = {
        [constraintId]: 'constraint-id',
        value: 'something',
        operator: 'IN',
        contextName: 'context',
    };

    const output = serializeConstraint(input);
    expect(constraintId in output).toBeFalsy();
});
