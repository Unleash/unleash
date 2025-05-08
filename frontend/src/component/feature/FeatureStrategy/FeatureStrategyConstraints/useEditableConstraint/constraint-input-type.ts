import {
    dateOperators,
    inOperators,
    numOperators,
    type Operator,
    semVerOperators,
    stringOperators,
} from 'constants/operators';

export const IN_OPERATORS_LEGAL_VALUES = 'IN_OPERATORS_LEGAL_VALUES';
export const STRING_OPERATORS_LEGAL_VALUES = 'STRING_OPERATORS_LEGAL_VALUES';
export const NUM_OPERATORS_LEGAL_VALUES = 'NUM_OPERATORS_LEGAL_VALUES';
export const SEMVER_OPERATORS_LEGAL_VALUES = 'SEMVER_OPERATORS_LEGAL_VALUES';
export const DATE_OPERATORS_SINGLE_VALUE = 'DATE_OPERATORS_SINGLE_VALUE';
export const IN_OPERATORS_FREETEXT = 'IN_OPERATORS_FREETEXT';
export const STRING_OPERATORS_FREETEXT = 'STRING_OPERATORS_FREETEXT';
export const NUM_OPERATORS_SINGLE_VALUE = 'NUM_OPERATORS_SINGLE_VALUE';
export const SEMVER_OPERATORS_SINGLE_VALUE = 'SEMVER_OPERATORS_SINGLE_VALUE';

export type Input =
    | 'IN_OPERATORS_LEGAL_VALUES'
    | 'STRING_OPERATORS_LEGAL_VALUES'
    | 'NUM_OPERATORS_LEGAL_VALUES'
    | 'SEMVER_OPERATORS_LEGAL_VALUES'
    | 'DATE_OPERATORS_SINGLE_VALUE'
    | 'IN_OPERATORS_FREETEXT'
    | 'STRING_OPERATORS_FREETEXT'
    | 'NUM_OPERATORS_SINGLE_VALUE'
    | 'SEMVER_OPERATORS_SINGLE_VALUE';

export const resolveInputType = (
    operator: Operator,
    hasLegalValues: boolean,
) => {
    if (hasLegalValues && inOperators.includes(operator)) {
        return IN_OPERATORS_LEGAL_VALUES;
    }
    if (hasLegalValues && stringOperators.includes(operator)) {
        return STRING_OPERATORS_LEGAL_VALUES;
    }
    if (hasLegalValues && numOperators.includes(operator)) {
        return NUM_OPERATORS_LEGAL_VALUES;
    }
    if (hasLegalValues && semVerOperators.includes(operator)) {
        return SEMVER_OPERATORS_LEGAL_VALUES;
    }
    if (dateOperators.includes(operator)) {
        return DATE_OPERATORS_SINGLE_VALUE;
    }
    if (inOperators.includes(operator)) {
        return IN_OPERATORS_FREETEXT;
    }
    if (stringOperators.includes(operator)) {
        return STRING_OPERATORS_FREETEXT;
    }
    if (numOperators.includes(operator)) {
        return NUM_OPERATORS_SINGLE_VALUE;
    }
    if (semVerOperators.includes(operator)) {
        return SEMVER_OPERATORS_SINGLE_VALUE;
    }
};
