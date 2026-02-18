export {
    NOT_IN,
    IN,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    STR_CONTAINS,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    DATE_AFTER,
    DATE_BEFORE,
    SEMVER_EQ,
    SEMVER_GT,
    SEMVER_LT,
    REGEX,
} from '@server/util/constants';
import {
    ALL_OPERATORS,
    NOT_IN,
    IN,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    STR_CONTAINS,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    DATE_AFTER,
    DATE_BEFORE,
    SEMVER_EQ,
    SEMVER_GT,
    SEMVER_LT,
    REGEX,
} from '@server/util/constants';

export type Operator = (typeof ALL_OPERATORS)[number];

export const allOperators = ALL_OPERATORS;

const isOperator =
    <T extends string>(operators: T[]) =>
    (operator: string): operator is T =>
        operators.includes(operator as T);

export const stringOperators = [STR_CONTAINS, STR_STARTS_WITH, STR_ENDS_WITH];
export type StringOperator = (typeof stringOperators)[number];
export const isStringOperator = isOperator(stringOperators);

export const inOperators = [IN, NOT_IN];
export type InOperator = (typeof inOperators)[number];
export const isInOperator = isOperator(inOperators);

export const numOperators = [NUM_EQ, NUM_GT, NUM_GTE, NUM_LT, NUM_LTE];
export type NumOperator = (typeof numOperators)[number];
export const isNumOperator = isOperator(numOperators);

export const dateOperators = [DATE_BEFORE, DATE_AFTER];
export type DateOperator = (typeof dateOperators)[number];
export const isDateOperator = isOperator(dateOperators);

export const semVerOperators = [SEMVER_EQ, SEMVER_GT, SEMVER_LT];
export type SemVerOperator = (typeof semVerOperators)[number];
export const isSemVerOperator = isOperator(semVerOperators);

export const regexOperators = [REGEX];
export type RegexOperator = (typeof regexOperators)[number];
export const isRegexOperator = isOperator(regexOperators);

export const singleValueOperators = [
    ...semVerOperators,
    ...dateOperators,
    ...numOperators,
    ...regexOperators,
];
export type SingleValueOperator = (typeof singleValueOperators)[number];
export const isSingleValueOperator = isOperator(singleValueOperators);

export const multipleValueOperators = [...stringOperators, ...inOperators];
export type MultiValueOperator = (typeof multipleValueOperators)[number];
export const isMultiValueOperator = isOperator(multipleValueOperators);

export const newOperators = [
    ...stringOperators,
    ...dateOperators,
    ...singleValueOperators,
];
export type NewOperator = (typeof newOperators)[number];
export const isNewOperator = isOperator(newOperators);
