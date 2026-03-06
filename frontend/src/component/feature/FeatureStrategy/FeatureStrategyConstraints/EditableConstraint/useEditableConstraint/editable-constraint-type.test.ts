import { createEmptyConstraint } from 'utils/createEmptyConstraint';
import { fromIConstraint, toIConstraint } from './editable-constraint-type.ts';
import { constraintId } from 'constants/constraintId';
import { REGEX } from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy.ts';

test('mapping to and from retains the constraint id', () => {
    const constraint = createEmptyConstraint('context');

    expect(toIConstraint(fromIConstraint(constraint))[constraintId]).toEqual(
        constraint[constraintId],
    );
});

test('mapping to an editable constraint adds a constraint id if there is none', () => {
    const constraint: IConstraint = createEmptyConstraint('context');
    delete constraint[constraintId];

    const editableConstraint = fromIConstraint(constraint);

    expect(editableConstraint[constraintId]).toBeDefined();

    const iConstraint = toIConstraint(editableConstraint);
    expect(iConstraint[constraintId]).toEqual(editableConstraint[constraintId]);
});

test('mapping from an empty constraint removes redundant value / values', () => {
    const constraint = { ...createEmptyConstraint('context'), value: '' };
    expect(constraint).toHaveProperty('value');

    const transformed = toIConstraint(fromIConstraint(constraint));
    expect(transformed).not.toHaveProperty('value');
});

test('if we have in DB REGEX constraint with inverted flag our UI has to reset it', () => {
    const constraint: IConstraint = {
        contextName: 'appName',
        operator: REGEX,
        value: 'some-pattern',
        inverted: true,
    };

    // REGEX does not support inversion; reset on load to avoid impossible state
    expect(fromIConstraint(constraint).inverted).toBe(false);
});
