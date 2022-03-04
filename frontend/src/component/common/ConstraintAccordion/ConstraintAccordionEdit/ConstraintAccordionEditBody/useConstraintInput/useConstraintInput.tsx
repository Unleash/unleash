import {
    inOperators,
    stringOperators,
    numOperators,
    semVerOperators,
    dateOperators,
} from 'constants/operators';
import { IUnleashContextDefinition } from 'interfaces/context';
import { IConstraint } from 'interfaces/strategy';
import React, { useCallback, useEffect, useState } from 'react';
import { exists } from 'utils/exists';
import { oneOf } from 'utils/one-of';

import {
    numberValidatorGenerator,
    stringValidatorGenerator,
    semVerValidatorGenerator,
    dateValidatorGenerator,
    ConstraintValidatorOutput,
} from './constraintValidators';

interface IUseConstraintInputProps {
    contextDefinition: IUnleashContextDefinition;
    localConstraint: IConstraint;
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

export const useConstraintInput = ({
    contextDefinition,
    localConstraint,
}: IUseConstraintInputProps): IUseConstraintOutput => {
    const [input, setInput] = useState<Input>(IN_OPERATORS_LEGAL_VALUES);
    const [validator, setValidator] = useState<Validator>(
        STRING_ARRAY_VALIDATOR
    );
    const [error, setError] = useState('');

    const resolveInputType = useCallback(() => {
        if (
            exists(contextDefinition.legalValues) &&
            oneOf(inOperators, localConstraint.operator)
        ) {
            setInput(IN_OPERATORS_LEGAL_VALUES);
        } else if (
            exists(contextDefinition.legalValues) &&
            oneOf(stringOperators, localConstraint.operator)
        ) {
            setInput(STRING_OPERATORS_LEGAL_VALUES);
        } else if (
            exists(contextDefinition.legalValues) &&
            oneOf(numOperators, localConstraint.operator)
        ) {
            setInput(NUM_OPERATORS_LEGAL_VALUES);
        } else if (
            exists(contextDefinition.legalValues) &&
            oneOf(semVerOperators, localConstraint.operator)
        ) {
            setInput(SEMVER_OPERATORS_LEGAL_VALUES);
        } else if (oneOf(dateOperators, localConstraint.operator)) {
            setInput(DATE_OPERATORS_SINGLE_VALUE);
        } else if (oneOf(inOperators, localConstraint.operator)) {
            setInput(IN_OPERATORS_FREETEXT);
        } else if (oneOf(stringOperators, localConstraint.operator)) {
            setInput(STRING_OPERATORS_FREETEXT);
        } else if (oneOf(numOperators, localConstraint.operator)) {
            setInput(NUM_OPERATORS_SINGLE_VALUE);
        } else if (oneOf(semVerOperators, localConstraint.operator)) {
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
            if (oneOf(numOperators, operator)) {
                setValidator(NUMBER_VALIDATOR);
            }

            if (oneOf([...stringOperators, ...inOperators], operator)) {
                setValidator(STRING_ARRAY_VALIDATOR);
            }

            if (oneOf(semVerOperators, operator)) {
                setValidator(SEMVER_VALIDATOR);
            }

            if (oneOf(dateOperators, operator)) {
                setValidator(DATE_VALIDATOR);
            }
        },
        [setValidator]
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
