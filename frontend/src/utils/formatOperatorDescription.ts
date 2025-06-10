import type { Operator } from 'constants/operators';

export const formatOperatorDescription = (
    operator: Operator,
    inverted?: boolean,
): string => {
    if (inverted) {
        return invertedConstraintOperatorDescriptions[operator];
    }
    return constraintOperatorDescriptions[operator];
};

const constraintOperatorDescriptions = {
    IN: 'is one of',
    NOT_IN: 'is not one of',
    STR_CONTAINS: 'is a string that contains',
    STR_STARTS_WITH: 'is a string that starts with',
    STR_ENDS_WITH: 'is a string that ends with',
    NUM_EQ: 'is a number equal to',
    NUM_GT: 'is a number greater than',
    NUM_GTE: 'is a number greater than or equal to',
    NUM_LT: 'is a number less than',
    NUM_LTE: 'is a number less than or equal to',
    DATE_BEFORE: 'is a date before',
    DATE_AFTER: 'is a date after',
    SEMVER_EQ: 'is a SemVer equal to',
    SEMVER_GT: 'is a SemVer greater than',
    SEMVER_LT: 'is a SemVer less than',
};

const invertedConstraintOperatorDescriptions = {
    IN: 'is not one of',
    NOT_IN: 'is one of',
    STR_CONTAINS: 'is a string that does not contain',
    STR_STARTS_WITH: 'is a string that does not start with',
    STR_ENDS_WITH: 'is a string that does not end with',
    NUM_EQ: 'is a number not equal to',
    NUM_GT: 'is a number not greater than',
    NUM_GTE: 'is a number less than',
    NUM_LT: 'is a number not less than',
    NUM_LTE: 'is a number greater than',
    DATE_BEFORE: 'is a date not before',
    DATE_AFTER: 'is a date not after',
    SEMVER_EQ: 'is a SemVer not equal to',
    SEMVER_GT: 'is a SemVer not greater than',
    SEMVER_LT: 'is a SemVer not less than',
};
