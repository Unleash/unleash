import type { IUnleashContextDefinition } from 'interfaces/context';
import type { IConstraint } from 'interfaces/strategy';
import { FreeTextInput } from '../FreeTextInput/FreeTextInput.tsx';
import { SingleValue } from '../SingleValue/SingleValue.tsx';
import {
    STRING_OPERATORS_FREETEXT,
    SEMVER_OPERATORS_SINGLE_VALUE,
    NUM_OPERATORS_SINGLE_VALUE,
    IN_OPERATORS_FREETEXT,
} from '../useConstraintInput/useConstraintInput.tsx';
import type React from 'react';

type ActionFilterItemInput =
    | typeof STRING_OPERATORS_FREETEXT
    | typeof SEMVER_OPERATORS_SINGLE_VALUE
    | typeof NUM_OPERATORS_SINGLE_VALUE
    | typeof IN_OPERATORS_FREETEXT;

interface IResolveInputProps {
    contextDefinition: Pick<IUnleashContextDefinition, 'legalValues'>;
    localConstraint: Pick<IConstraint, 'value' | 'values'>;
    constraintValues: string[];
    constraintValue: string;
    setValue: (value: string) => void;
    setValues: (values: string[]) => void;
    setValuesWithRecord: (values: string[]) => void;
    setError: React.Dispatch<React.SetStateAction<string>>;
    removeValue: (index: number) => void;
    input: ActionFilterItemInput;
    error: string;
}

/**
 * @deprecated; Need an input? Prefer using specific input components.
 *
 * For the case of `ProjectActionsFilterItem.tsx`: it already excludes legal
 * values and date operators. This leaves only free text and single value
 * text/numeric operators. Alternatively, consider rewriting this component to only handle those cases.
 */
export const ResolveInput = ({
    input,
    localConstraint,
    setValue,
    setValuesWithRecord,
    setError,
    removeValue,
    error,
}: IResolveInputProps) => {
    const resolveInput = () => {
        switch (input) {
            case IN_OPERATORS_FREETEXT:
            case STRING_OPERATORS_FREETEXT:
                return (
                    <FreeTextInput
                        values={localConstraint.values || []}
                        removeValue={removeValue}
                        setValues={setValuesWithRecord}
                        error={error}
                        setError={setError}
                    />
                );
            case NUM_OPERATORS_SINGLE_VALUE:
                return (
                    <SingleValue
                        setValue={setValue}
                        value={localConstraint.value}
                        type='number'
                        error={error}
                        setError={setError}
                    />
                );
            case SEMVER_OPERATORS_SINGLE_VALUE:
                return (
                    <SingleValue
                        setValue={setValue}
                        value={localConstraint.value}
                        type='semver'
                        error={error}
                        setError={setError}
                    />
                );
        }
    };

    return <>{resolveInput()}</>;
};
