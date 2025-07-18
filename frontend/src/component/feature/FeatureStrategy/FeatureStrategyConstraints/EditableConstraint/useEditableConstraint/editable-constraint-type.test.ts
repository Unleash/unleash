import { createEmptyConstraint } from 'utils/createEmptyConstraint';
import { fromIConstraint, toIConstraint } from './editable-constraint-type.ts';
import { constraintId } from 'constants/constraintId';

test('mapping to and from retains the constraint id', () => {
    const constraint = createEmptyConstraint('context');

    expect(toIConstraint(fromIConstraint(constraint))[constraintId]).toEqual(
        constraint[constraintId],
    );
});

test('mapping from an empty constraint removes redundant value / values', () => {
    const constraint = { ...createEmptyConstraint('context'), value: '' };
    expect(constraint).toHaveProperty('value');

    const transformed = toIConstraint(fromIConstraint(constraint));
    expect(transformed).not.toHaveProperty('value');
});
