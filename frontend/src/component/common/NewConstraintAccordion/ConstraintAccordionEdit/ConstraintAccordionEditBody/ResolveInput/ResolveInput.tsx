import type {
    ILegalValue,
    IUnleashContextDefinition,
} from 'interfaces/context';
import type { IConstraint } from 'interfaces/strategy';
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
    type Input,
} from '../useConstraintInput/useConstraintInput';
import type React from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { LegalValuesSelector } from 'component/feature/FeatureStrategy/FeatureStrategyConstraints/LegalValuesSelector';

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
    input: Input;
    error: string;
}

const resolveLegalValues = (
    values: IConstraint['values'],
    legalValues: IUnleashContextDefinition['legalValues'],
): { legalValues: ILegalValue[]; deletedLegalValues: ILegalValue[] } => {
    if (legalValues?.length === 0) {
        return {
            legalValues: [],
            deletedLegalValues: [],
        };
    }

    const deletedLegalValues = (values || [])
        .filter(
            (value) =>
                !(legalValues || []).some(
                    ({ value: legalValue }) => legalValue === value,
                ),
        )
        .map((v) => ({ value: v, description: '' }));

    return {
        legalValues: legalValues || [],
        deletedLegalValues,
    };
};

/**
 * @deprecated; remove with `addEditStrategy` flag. Need an input? Prefer using specific input components.
 *
 * For the case of `ProjectActionsFilterItem.tsx`: it already excludes legal
 * values and date operators. This leaves only free text and single value
 * text/numeric operators. Alternatively, consider rewriting this component to only handle those cases.
 */
export const ResolveInput = ({
    input,
    contextDefinition,
    constraintValues,
    constraintValue,
    localConstraint,
    setValue,
    setValues,
    setValuesWithRecord,
    setError,
    removeValue,
    error,
}: IResolveInputProps) => {
    const useNewLegalValueInput = useUiFlag('addEditStrategy');
    const resolveInput = () => {
        switch (input) {
            case IN_OPERATORS_LEGAL_VALUES:
            case STRING_OPERATORS_LEGAL_VALUES:
                return useNewLegalValueInput ? (
                    <LegalValuesSelector
                        data={resolveLegalValues(
                            constraintValues,
                            contextDefinition.legalValues,
                        )}
                        constraintValues={constraintValues}
                        values={localConstraint.values || []}
                        setValuesWithRecord={setValuesWithRecord}
                        setValues={setValues}
                    />
                ) : (
                    <RestrictiveLegalValues
                        data={resolveLegalValues(
                            constraintValues,
                            contextDefinition.legalValues,
                        )}
                        constraintValues={constraintValues}
                        values={localConstraint.values || []}
                        setValuesWithRecord={setValuesWithRecord}
                        setValues={setValues}
                        error={error}
                        setError={setError}
                    />
                );
            case NUM_OPERATORS_LEGAL_VALUES:
                return (
                    <>
                        <SingleLegalValue
                            data={resolveLegalValues(
                                [constraintValue],
                                contextDefinition.legalValues,
                            )}
                            setValue={setValue}
                            value={localConstraint.value}
                            constraintValue={constraintValue}
                            type='number'
                            legalValues={
                                contextDefinition.legalValues?.filter(
                                    (legalValue) => Number(legalValue.value),
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
                            data={resolveLegalValues(
                                [constraintValue],
                                contextDefinition.legalValues,
                            )}
                            setValue={setValue}
                            value={localConstraint.value}
                            constraintValue={constraintValue}
                            type='semver'
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
                        setValues={setValuesWithRecord}
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
                            setValues={setValuesWithRecord}
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
