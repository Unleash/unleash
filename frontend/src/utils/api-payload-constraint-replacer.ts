import { isSingleValueOperator } from 'constants/operators';
import type { IConstraint } from 'interfaces/strategy';

export const serializeConstraint = ({
    value,
    values,
    inverted,
    operator,
    contextName,
    caseInsensitive,
}: IConstraint): IConstraint => {
    const makeConstraint = (
        valueProp: { value: string } | { values: string[] },
    ): IConstraint => {
        return {
            contextName,
            operator,
            ...valueProp,
            caseInsensitive,
            inverted,
        };
    };

    if (isSingleValueOperator(operator)) {
        return makeConstraint({ value: value || '' });
    }

    return makeConstraint({ values: values || [] });
};

export const apiPayloadConstraintReplacer = (key: string, value: any) => {
    if (key !== 'constraints' || !Array.isArray(value)) {
        return value;
    }
    const orderedConstraints = (value as IConstraint[]).map(
        serializeConstraint,
    );
    return orderedConstraints;
};
