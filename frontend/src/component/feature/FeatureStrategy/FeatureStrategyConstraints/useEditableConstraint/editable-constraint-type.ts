import { singleValueOperators } from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';

export type EditableConstraint = Omit<IConstraint, 'values' | 'value'> &
    (
        | {
              values: Set<string>;
          }
        | { value: string }
    );

export const fromIConstraint = (
    constraint: IConstraint,
): EditableConstraint => {
    const { value, values, ...rest } = constraint;
    if (singleValueOperators.includes(constraint.operator)) {
        return {
            ...rest,
            value: value ?? '',
        };
    } else {
        return {
            ...rest,
            values: new Set(values),
        };
    }
};

export const toIConstraint = (constraint: EditableConstraint): IConstraint => {
    if ('value' in constraint) {
        return constraint;
    } else {
        const { values, ...rest } = constraint;
        return {
            ...rest,
            values: Array.from(values),
        };
    }
};
