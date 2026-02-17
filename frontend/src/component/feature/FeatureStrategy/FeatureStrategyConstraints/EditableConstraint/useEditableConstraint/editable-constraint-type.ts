import { constraintId } from 'constants/constraintId';
import {
    type DateOperator,
    isDateOperator,
    isMultiValueOperator,
    isSingleValueOperator,
    type NumOperator,
    type SemVerOperator,
    type MultiValueOperator,
    type RegexOperator,
    isNumOperator,
    isSemVerOperator,
    isRegexOperator,
} from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';

type EditableConstraintBase = Omit<
    IConstraint,
    'operator' | 'values' | 'value'
>;

export type EditableNumberConstraint = EditableConstraintBase & {
    operator: NumOperator;
    value: string;
};
export type EditableDateConstraint = EditableConstraintBase & {
    operator: DateOperator;
    value: string;
};
export type EditableSemVerConstraint = EditableConstraintBase & {
    operator: SemVerOperator;
    value: string;
};

export type EditableRegexConstraint = EditableConstraintBase & {
    operator: RegexOperator;
    value: string;
};

export type EditableMultiValueConstraint = EditableConstraintBase & {
    operator: MultiValueOperator;
    values: Set<string>;
};

export type EditableSingleValueConstraint =
    | EditableNumberConstraint
    | EditableDateConstraint
    | EditableSemVerConstraint
    | EditableRegexConstraint;

export type EditableConstraint =
    | EditableSingleValueConstraint
    | EditableMultiValueConstraint;

export const isMultiValueConstraint = (
    constraint: EditableConstraint,
): constraint is EditableMultiValueConstraint =>
    isMultiValueOperator(constraint.operator);

export const isSingleValueConstraint = (
    constraint: EditableConstraint,
): constraint is EditableSingleValueConstraint =>
    !isMultiValueConstraint(constraint);

export const isDateConstraint = (
    constraint: EditableConstraint,
): constraint is EditableDateConstraint => isDateOperator(constraint.operator);

export const isNumberConstraint = (
    constraint: EditableConstraint,
): constraint is EditableNumberConstraint => isNumOperator(constraint.operator);

export const isSemVerConstraint = (
    constraint: EditableConstraint,
): constraint is EditableSemVerConstraint =>
    isSemVerOperator(constraint.operator);

export const isRegexConstraint = (
    constraint: EditableConstraint,
): constraint is EditableRegexConstraint =>
    isRegexOperator(constraint.operator);

export const fromIConstraint = (
    constraint: IConstraint,
): EditableConstraint => {
    const { value, values, operator, ...rest } = constraint;
    if (isSingleValueOperator(operator)) {
        return {
            [constraintId]: crypto.randomUUID(),
            ...rest,
            operator,
            value: value ?? '',
        };
    } else {
        return {
            [constraintId]: crypto.randomUUID(),
            ...rest,
            operator,
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
            values: Array.from(constraint.values),
        };
    }
};
