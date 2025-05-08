import {
    inOperators,
    stringOperators,
    isInOperator,
    isStringOperator,
    isNumOperator,
    isSemVerOperator,
    isDateOperator,
    type Operator,
} from 'constants/operators';
import type { IUnleashContextDefinition } from 'interfaces/context';
import type { IConstraint } from 'interfaces/strategy';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { oneOf } from 'utils/oneOf';

import {
    numberValidatorGenerator,
    stringValidatorGenerator,
    semVerValidatorGenerator,
    dateValidatorGenerator,
    type ConstraintValidatorOutput,
} from './constraintValidators';
import { nonEmptyArray } from 'utils/nonEmptyArray';

interface IUseConstraintInputProps {
    contextDefinition: Pick<IUnleashContextDefinition, 'legalValues'>;
    localConstraint: Pick<IConstraint, 'operator' | 'value' | 'values'>;
}

interface IUseConstraintOutput {
    input: Input;
    error: string;
    validator: () => ConstraintValidatorOutput;
    setError: React.Dispatch<React.SetStateAction<string>>;
}

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

const NUMBER_VALIDATOR = 'NUMBER_VALIDATOR';
const SEMVER_VALIDATOR = 'SEMVER_VALIDATOR';
const STRING_ARRAY_VALIDATOR = 'STRING_ARRAY_VALIDATOR';
const DATE_VALIDATOR = 'DATE_VALIDATOR';

type Validator =
    | 'NUMBER_VALIDATOR'
    | 'SEMVER_VALIDATOR'
    | 'STRING_ARRAY_VALIDATOR'
    | 'DATE_VALIDATOR';

/**
 * @deprecated; remove with `addEditStrategy` flag. This component requires a lot of state and mixes many components. Better off using dedicated pieces where you need them.
 */
export const useConstraintInput = ({
    contextDefinition,
    localConstraint,
}: IUseConstraintInputProps): IUseConstraintOutput => {
    const [input, setInput] = useState<Input>(IN_OPERATORS_FREETEXT);
    const [validator, setValidator] = useState<Validator>(
        STRING_ARRAY_VALIDATOR,
    );
    const [error, setError] = useState('');

    const resolveInputType = useCallback(() => {
        if (
            nonEmptyArray(contextDefinition.legalValues) &&
            isInOperator(localConstraint.operator)
        ) {
            setInput(IN_OPERATORS_LEGAL_VALUES);
        } else if (
            nonEmptyArray(contextDefinition.legalValues) &&
            isStringOperator(localConstraint.operator)
        ) {
            setInput(STRING_OPERATORS_LEGAL_VALUES);
        } else if (
            nonEmptyArray(contextDefinition.legalValues) &&
            isNumOperator(localConstraint.operator)
        ) {
            setInput(NUM_OPERATORS_LEGAL_VALUES);
        } else if (
            nonEmptyArray(contextDefinition.legalValues) &&
            isSemVerOperator(localConstraint.operator)
        ) {
            setInput(SEMVER_OPERATORS_LEGAL_VALUES);
        } else if (isDateOperator(localConstraint.operator)) {
            setInput(DATE_OPERATORS_SINGLE_VALUE);
        } else if (isInOperator(localConstraint.operator)) {
            setInput(IN_OPERATORS_FREETEXT);
        } else if (isStringOperator(localConstraint.operator)) {
            setInput(STRING_OPERATORS_FREETEXT);
        } else if (isNumOperator(localConstraint.operator)) {
            setInput(NUM_OPERATORS_SINGLE_VALUE);
        } else if (isSemVerOperator(localConstraint.operator)) {
            setInput(SEMVER_OPERATORS_SINGLE_VALUE);
        }
    }, [localConstraint, contextDefinition]);

    const resolveValidator = () => {
        switch (validator) {
            case NUMBER_VALIDATOR:
                return numberValidatorGenerator(localConstraint.value);
            case STRING_ARRAY_VALIDATOR:
                return stringValidatorGenerator(localConstraint.values || []);
            case SEMVER_VALIDATOR:
                return semVerValidatorGenerator(localConstraint.value || '');
            case DATE_VALIDATOR:
                return dateValidatorGenerator(localConstraint.value || '');
        }
    };

    const resolveValidatorType = useCallback(
        (operator: string) => {
            if (isNumOperator(operator as Operator)) {
                setValidator(NUMBER_VALIDATOR);
            }

            if (oneOf([...stringOperators, ...inOperators], operator)) {
                setValidator(STRING_ARRAY_VALIDATOR);
            }

            if (isSemVerOperator(operator)) {
                setValidator(SEMVER_VALIDATOR);
            }

            if (isDateOperator(operator)) {
                setValidator(DATE_VALIDATOR);
            }
        },
        [setValidator],
    );

    useEffect(() => {
        resolveValidatorType(localConstraint.operator);
    }, [
        localConstraint.operator,
        localConstraint.value,
        localConstraint.values,
        resolveValidatorType,
    ]);

    useEffect(() => {
        resolveInputType();
    }, [contextDefinition, localConstraint, resolveInputType]);

    return { input, error, validator: resolveValidator(), setError };
};
