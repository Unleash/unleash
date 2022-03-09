import {
    DATE_BEFORE,
    DATE_AFTER,
    IN,
    NOT_IN,
    NUM_EQ,
    NUM_GT,
    NUM_GTE,
    NUM_LT,
    NUM_LTE,
    STR_CONTAINS,
    STR_ENDS_WITH,
    STR_STARTS_WITH,
    SEMVER_EQ,
    SEMVER_GT,
    SEMVER_LT,
    Operator,
} from '../../../../../constants/operators';

export const resolveText = (operator: Operator, contextName: string) => {
    const base = `To satisfy this constraint, values passed into the SDK as ${contextName} must`;

    if (operator === IN) {
        return `${base} include:`;
    }

    if (operator === NOT_IN) {
        return `${base} not include:`;
    }

    if (operator === STR_ENDS_WITH) {
        return `${base} end with:`;
    }

    if (operator === STR_STARTS_WITH) {
        return `${base} start with:`;
    }

    if (operator === STR_CONTAINS) {
        return `${base} contain:`;
    }

    if (operator === NUM_EQ) {
        return `${base} match:`;
    }

    if (operator === NUM_GT) {
        return `${base} be greater than:`;
    }

    if (operator === NUM_GTE) {
        return `${base} be greater than or equal to:`;
    }

    if (operator === NUM_LT) {
        return `${base} be less than:`;
    }

    if (operator === NUM_LTE) {
        return `${base} be less than or equal to:`;
    }

    if (operator === DATE_AFTER) {
        return `${base} be after the following date`;
    }

    if (operator === DATE_BEFORE) {
        return `${base} be before the following date:`;
    }

    if (operator === SEMVER_EQ) {
        return `${base} match the following version:`;
    }

    if (operator === SEMVER_GT) {
        return `${base} be greater than the following version:`;
    }

    if (operator === SEMVER_LT) {
        return `${base} be less than the following version:`;
    }
};
