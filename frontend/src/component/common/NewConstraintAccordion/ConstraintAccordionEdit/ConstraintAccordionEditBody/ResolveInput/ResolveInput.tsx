import type { IConstraint } from 'interfaces/strategy';
import { FreeTextInput } from '../FreeTextInput/FreeTextInput.tsx';
import { SingleValue } from '../SingleValue/SingleValue.tsx';
import {
    STRING_OPERATORS_FREETEXT,
    SEMVER_OPERATORS_SINGLE_VALUE,
    NUM_OPERATORS_SINGLE_VALUE,
    IN_OPERATORS_FREETEXT,
    type Input,
} from '../useConstraintInput/useConstraintInput.tsx';
import type React from 'react';

interface IResolveInputProps {
    localConstraint: Pick<IConstraint, 'value' | 'values'>;
    setValue: (value: string) => void;
    setValues: (values: string[]) => void;
    setError: React.Dispatch<React.SetStateAction<string>>;
    removeValue: (index: number) => void;
    input: Input;
    error: string;
}

/**
 * @deprecated; remove with `addEditStrategy` flag. Need an input? Prefer using specific input components.
 *
 * For the case of `ProjectActionsFilterItem.tsx`: it already excludes legal
 * values and date operators. This leaves only free text and single value
 * text/numeric operators. Alternatively, consider rewriting this component to only handle those cases.
 */
export const ResolveInput = ({
    input,
    localConstraint,
    setValue,
    setValues,
    setError,
    removeValue,
    error,
}: IResolveInputProps) => {
    const resolveInput = () => {
        switch (input) {
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
