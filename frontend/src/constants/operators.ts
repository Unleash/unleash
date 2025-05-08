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

export const stringOperators = [STR_CONTAINS, STR_STARTS_WITH, STR_ENDS_WITH];
export type StringOperator = (typeof stringOperators)[number];

export const inOperators = [IN, NOT_IN];
export type InOperator = (typeof inOperators)[number];

export const numOperators = [NUM_EQ, NUM_GT, NUM_GTE, NUM_LT, NUM_LTE];
export type NumOperator = (typeof numOperators)[number];

export const dateOperators = [DATE_BEFORE, DATE_AFTER];
export type DateOperator = (typeof dateOperators)[number];

export const semVerOperators = [SEMVER_EQ, SEMVER_GT, SEMVER_LT];
export type SemVerOperator = (typeof semVerOperators)[number];

export const singleValueOperators = [
    ...semVerOperators,
    ...dateOperators,
    ...numOperators,
];
export type SingleValueOperator = (typeof singleValueOperators)[number];

export const multipleValueOperators = [...stringOperators, ...inOperators];
export type MultiValueOperator = (typeof multipleValueOperators)[number];

export const newOperators = [
    ...stringOperators,
    ...dateOperators,
    ...singleValueOperators,
];
export type NewOperator = (typeof newOperators)[number];

export const isSingleValueOperator = (
    operator: string,
): operator is SingleValueOperator =>
    singleValueOperators.includes(operator as SingleValueOperator);

export const isMultiValueOperator = (
    operator: string,
): operator is MultiValueOperator =>
    multipleValueOperators.includes(operator as MultiValueOperator);

export const isStringOperator = (
    operator: string,
): operator is StringOperator =>
    stringOperators.includes(operator as StringOperator);

export const isInOperator = (operator: string): operator is InOperator =>
    inOperators.includes(operator as InOperator);

export const isNumOperator = (operator: string): operator is NumOperator =>
    numOperators.includes(operator as NumOperator);

export const isDateOperator = (operator: string): operator is DateOperator =>
    dateOperators.includes(operator as DateOperator);

export const isSemVerOperator = (
    operator: string,
): operator is SemVerOperator =>
    semVerOperators.includes(operator as SemVerOperator);

export const isNewOperator = (operator: string): operator is NewOperator =>
    newOperators.includes(operator as NewOperator);
