import { IUnleashContextDefinition } from 'interfaces/context';
import { IConstraint } from 'interfaces/strategy';
import { DateSingleValue } from '../DateSingleValue/DateSingleValue';
import { FreeTextInput } from '../FreeTextInput/FreeTextInput';
import { RestrictiveLegalValues } from '../RestrictiveLegalValues/RestrictiveLegalValues';
import { SingleLegalValue } from '../SingleLegalValue/SingleLegalValue';
import { SingleValue } from '../SingleValue/SingleValue';
import {
    IN_OPERATORS_LEGAL_VALUES,
    STRING_OPERATORS_FREETEXT,
    STRING_OPERATORS_LEGAL_VALUES,
    SEMVER_OPERATORS_SINGLE_VALUE,
    NUM_OPERATORS_LEGAL_VALUES,
    NUM_OPERATORS_SINGLE_VALUE,
    SEMVER_OPERATORS_LEGAL_VALUES,
    DATE_OPERATORS_SINGLE_VALUE,
    IN_OPERATORS_FREETEXT,
    Input,
} from '../useConstraintInput/useConstraintInput';
import React from 'react';

interface IResolveInputProps {
    contextDefinition: IUnleashContextDefinition;
    localConstraint: IConstraint;
    setValue: (value: string) => void;
    setValues: (values: string[]) => void;
    setError: React.Dispatch<React.SetStateAction<string>>;
    removeValue: (index: number) => void;
    input: Input;
    error: string;
}

export const ResolveInput = ({
    input,
    contextDefinition,
    localConstraint,
    setValue,
    setValues,
    setError,
    removeValue,
    error,
}: IResolveInputProps) => {
    const resolveInput = () => {
        switch (input) {
            case IN_OPERATORS_LEGAL_VALUES:
                return (
                    <RestrictiveLegalValues
                        legalValues={contextDefinition.legalValues || []}
                        values={localConstraint.values || []}
                        setValues={setValues}
                        error={error}
                        setError={setError}
                    />
                );
            case STRING_OPERATORS_LEGAL_VALUES:
                return (
                    <>
                        <RestrictiveLegalValues
                            legalValues={contextDefinition.legalValues || []}
                            values={localConstraint.values || []}
                            setValues={setValues}
                            error={error}
                            setError={setError}
                        />
                    </>
                );
            case NUM_OPERATORS_LEGAL_VALUES:
                return (
                    <>
                        <SingleLegalValue
                            setValue={setValue}
                            value={localConstraint.value}
                            type="number"
                            legalValues={
                                contextDefinition.legalValues?.filter(
                                    legalValue => Number(legalValue.value)
                                ) || []
                            }
                            error={error}
                            setError={setError}
                        />
                    </>
                );
            case SEMVER_OPERATORS_LEGAL_VALUES:
                return (
                    <>
                        <SingleLegalValue
                            setValue={setValue}
                            value={localConstraint.value}
                            type="semver"
                            legalValues={contextDefinition.legalValues || []}
                            error={error}
                            setError={setError}
                        />
                    </>
                );
            case DATE_OPERATORS_SINGLE_VALUE:
                return (
                    <DateSingleValue
                        value={localConstraint.value}
                        setValue={setValue}
                        error={error}
                        setError={setError}
                    />
                );
            case IN_OPERATORS_FREETEXT:
                return (
                    <FreeTextInput
                        values={localConstraint.values || []}
                        removeValue={removeValue}
                        setValues={setValues}
                        error={error}
                        setError={setError}
                    />
                );
            case STRING_OPERATORS_FREETEXT:
                return (
                    <>
                        <FreeTextInput
                            values={localConstraint.values || []}
                            removeValue={removeValue}
                            setValues={setValues}
                            error={error}
                            setError={setError}
                        />
                    </>
                );
            case NUM_OPERATORS_SINGLE_VALUE:
                return (
                    <SingleValue
                        setValue={setValue}
                        value={localConstraint.value}
                        type="number"
                        error={error}
                        setError={setError}
                    />
                );
            case SEMVER_OPERATORS_SINGLE_VALUE:
                return (
                    <SingleValue
                        setValue={setValue}
                        value={localConstraint.value}
                        type="semver"
                        error={error}
                        setError={setError}
                    />
                );
        }
    };

    return <>{resolveInput()}</>;
};
