import { createEmptyConstraint } from 'utils/createEmptyConstraint';
import { fromIConstraint, toIConstraint } from './editable-constraint-type.ts';
import { constraintId } from 'constants/constraintId';

test('mapping to and from retains the constraint id', () => {
    const constraint = createEmptyConstraint('context');

    expect(toIConstraint(fromIConstraint(constraint))[constraintId]).toEqual(
        constraint[constraintId],
    );
});

test('mapping to from an empty constraint removes redundant value / values', () => {
    const constraint = createEmptyConstraint('context');
    expect('value' in constraint).toBe(true);

    const transformed = toIConstraint(fromIConstraint(constraint));
    expect('value' in transformed).toBe(false);
});

test('mapping to constraint returns properties in expected order', () => {
    const constraint = createEmptyConstraint('context');
    const transformed = toIConstraint(fromIConstraint(constraint));

    expect(Object.keys(transformed)).toEqual([
        'values',
        'inverted',
        'operator',
        'contextName',
        'caseInsensitive',
    ]);
});
