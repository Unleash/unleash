import { gt as semverGt, lt as semverLt, eq as semverEq } from 'semver';
import type { Context } from './context.js';
import { resolveContextValue } from './helpers.js';
import { RE2JS } from 're2js';
import { ALL_OPERATORS } from '../../../util/constants.js';

export interface Constraint {
    contextName: string;
    operator: Operator;
    inverted: boolean;
    values: string[];
    value?: string | number | Date;
    caseInsensitive?: boolean;
}

export type Operator = (typeof ALL_OPERATORS)[number];
export const Operator = Object.fromEntries(
    ALL_OPERATORS.map((op) => [op, op]),
) as { [K in Operator]: K };

export type OperatorImpl = (
    constraint: Constraint,
    context: Context,
) => boolean;

const cleanValues = (values: string[]) =>
    values.filter((v) => !!v).map((v) => v.trim());

const InOperator = (constraint: Constraint, context: Context) => {
    const field = constraint.contextName;
    const caseInsensitive = Boolean(constraint.caseInsensitive);
    const values = cleanValues(constraint.values);
    const contextValue = resolveContextValue(context, field);

    const isIn = values.some((val) =>
        caseInsensitive
            ? val.toLowerCase() === contextValue?.toLowerCase()
            : val === contextValue,
    );
    return constraint.operator === Operator.IN ? isIn : !isIn;
};

const StringOperator = (constraint: Constraint, context: Context) => {
    const { contextName, operator, caseInsensitive } = constraint;
    let values = cleanValues(constraint.values);
    let contextValue = resolveContextValue(context, contextName);

    if (caseInsensitive) {
        values = values.map((v) => v.toLocaleLowerCase());
        contextValue = contextValue?.toLocaleLowerCase();
    }

    if (operator === Operator.STR_STARTS_WITH) {
        return values.some((val) => contextValue?.startsWith(val));
    }
    if (operator === Operator.STR_ENDS_WITH) {
        return values.some((val) => contextValue?.endsWith(val));
    }
    if (operator === Operator.STR_CONTAINS) {
        return values.some((val) => contextValue?.includes(val));
    }
    return false;
};

const SemverOperator = (constraint: Constraint, context: Context) => {
    const { contextName, operator } = constraint;
    const value = constraint.value as string;
    const contextValue = resolveContextValue(context, contextName);
    if (!contextValue) {
        return false;
    }

    try {
        if (operator === Operator.SEMVER_EQ) {
            return semverEq(contextValue, value);
        }
        if (operator === Operator.SEMVER_LT) {
            return semverLt(contextValue, value);
        }
        if (operator === Operator.SEMVER_GT) {
            return semverGt(contextValue, value);
        }
    } catch (_e) {
        return false;
    }
    return false;
};

const DateOperator = (constraint: Constraint, context: Context) => {
    const { operator } = constraint;
    const value = new Date(constraint.value as string);
    const currentTime = context.currentTime
        ? new Date(context.currentTime)
        : new Date();

    if (operator === Operator.DATE_AFTER) {
        return currentTime > value;
    }
    if (operator === Operator.DATE_BEFORE) {
        return currentTime < value;
    }
    return false;
};

const NumberOperator = (constraint: Constraint, context: Context) => {
    const field = constraint.contextName;
    const { operator } = constraint;
    const value = Number(constraint.value);
    const contextValue = Number(resolveContextValue(context, field));

    if (Number.isNaN(value) || Number.isNaN(contextValue)) {
        return false;
    }

    if (operator === Operator.NUM_EQ) {
        return contextValue === value;
    }
    if (operator === Operator.NUM_GT) {
        return contextValue > value;
    }
    if (operator === Operator.NUM_GTE) {
        return contextValue >= value;
    }
    if (operator === Operator.NUM_LT) {
        return contextValue < value;
    }
    if (operator === Operator.NUM_LTE) {
        return contextValue <= value;
    }
    return false;
};

const RegexOperator = (constraint: Constraint, context: Context) => {
    const field = constraint.contextName;
    const value = constraint.value as string;
    const contextValue = resolveContextValue(context, field);

    if (typeof contextValue !== 'string') {
        return false;
    }

    try {
        const regex = RE2JS.compile(
            value,
            constraint.caseInsensitive ? RE2JS.CASE_INSENSITIVE : undefined,
        );

        return regex.matcher(contextValue).find() as boolean;
    } catch (_e) {
        return false;
    }
};

export const operators = new Map<Operator, OperatorImpl>();
operators.set(Operator.IN, InOperator);
operators.set(Operator.NOT_IN, InOperator);
operators.set(Operator.STR_STARTS_WITH, StringOperator);
operators.set(Operator.STR_ENDS_WITH, StringOperator);
operators.set(Operator.STR_CONTAINS, StringOperator);
operators.set(Operator.NUM_EQ, NumberOperator);
operators.set(Operator.NUM_LT, NumberOperator);
operators.set(Operator.NUM_LTE, NumberOperator);
operators.set(Operator.NUM_GT, NumberOperator);
operators.set(Operator.NUM_GTE, NumberOperator);
operators.set(Operator.DATE_AFTER, DateOperator);
operators.set(Operator.DATE_BEFORE, DateOperator);
operators.set(Operator.SEMVER_EQ, SemverOperator);
operators.set(Operator.SEMVER_GT, SemverOperator);
operators.set(Operator.SEMVER_LT, SemverOperator);
operators.set(Operator.REGEX, RegexOperator);
