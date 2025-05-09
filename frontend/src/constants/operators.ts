export type Operator =
    | 'NOT_IN'
    | 'IN'
    | 'STR_ENDS_WITH'
    | 'STR_STARTS_WITH'
    | 'STR_CONTAINS'
    | 'NUM_EQ'
    | 'NUM_GT'
    | 'NUM_GTE'
    | 'NUM_LT'
    | 'NUM_LTE'
    | 'DATE_AFTER'
    | 'DATE_BEFORE'
    | 'SEMVER_EQ'
    | 'SEMVER_GT'
    | 'SEMVER_LT';

export const NOT_IN = 'NOT_IN' as const;
export const IN = 'IN' as const;
export const STR_ENDS_WITH = 'STR_ENDS_WITH' as const;
export const STR_STARTS_WITH = 'STR_STARTS_WITH' as const;
export const STR_CONTAINS = 'STR_CONTAINS' as const;
export const NUM_EQ = 'NUM_EQ' as const;
export const NUM_GT = 'NUM_GT' as const;
export const NUM_GTE = 'NUM_GTE' as const;
export const NUM_LT = 'NUM_LT' as const;
export const NUM_LTE = 'NUM_LTE' as const;
export const DATE_AFTER = 'DATE_AFTER' as const;
export const DATE_BEFORE = 'DATE_BEFORE' as const;
export const SEMVER_EQ = 'SEMVER_EQ' as const;
export const SEMVER_GT = 'SEMVER_GT' as const;
export const SEMVER_LT = 'SEMVER_LT' as const;

export const allOperators: Operator[] = [
    IN,
    NOT_IN,
    STR_CONTAINS,
    STR_STARTS_WITH,
    STR_ENDS_WITH,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    DATE_BEFORE,
    DATE_AFTER,
    SEMVER_EQ,
    SEMVER_GT,
    SEMVER_LT,
];

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

export const singleValueOperators = [
    ...semVerOperators,
    ...dateOperators,
    ...numOperators,
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
