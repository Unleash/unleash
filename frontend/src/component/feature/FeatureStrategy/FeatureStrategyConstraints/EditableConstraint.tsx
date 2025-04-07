import { styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { DateSingleValue } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/DateSingleValue/DateSingleValue';
import { FreeTextInput } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/FreeTextInput/FreeTextInput';
import { RestrictiveLegalValues } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/RestrictiveLegalValues/RestrictiveLegalValues';
import { SingleLegalValue } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/SingleLegalValue/SingleLegalValue';
import { SingleValue } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/SingleValue/SingleValue';
import {
    DATE_OPERATORS_SINGLE_VALUE,
    IN_OPERATORS_FREETEXT,
    IN_OPERATORS_LEGAL_VALUES,
    NUM_OPERATORS_LEGAL_VALUES,
    NUM_OPERATORS_SINGLE_VALUE,
    SEMVER_OPERATORS_LEGAL_VALUES,
    SEMVER_OPERATORS_SINGLE_VALUE,
    STRING_OPERATORS_FREETEXT,
    STRING_OPERATORS_LEGAL_VALUES,
    type Input,
} from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import { CaseSensitiveButton } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/StyledToggleButton/CaseSensitiveButton/CaseSensitiveButton';
import { ConstraintOperatorSelect } from 'component/common/NewConstraintAccordion/ConstraintOperatorSelect';
import {
    DATE_AFTER,
    dateOperators,
    IN,
    stringOperators,
    type Operator,
} from 'constants/operators';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type {
    ILegalValue,
    IUnleashContextDefinition,
} from 'interfaces/context';
import type { IConstraint } from 'interfaces/strategy';
import { useEffect, useState, type FC } from 'react';
import { oneOf } from 'utils/oneOf';
import {
    CURRENT_TIME_CONTEXT_FIELD,
    operatorsForContext,
} from 'utils/operatorsForContext';

const Container = styled('article')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

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

type Props = {
    localConstraint: IConstraint;
    setContextName: (contextName: string) => void;
    setOperator: (operator: Operator) => void;
    setLocalConstraint: React.Dispatch<React.SetStateAction<IConstraint>>;
    action: string;
    compact: boolean;
    onDelete?: () => void;
    setInvertedOperator: () => void;
    setCaseInsensitive: () => void;
    onUndo: () => void;
    constraintChanges: IConstraint[];
    contextDefinition: Pick<IUnleashContextDefinition, 'legalValues'>;
    constraintValues: string[];
    constraintValue: string;
    setValue: (value: string) => void;
    setValues: (values: string[]) => void;
    setValuesWithRecord: (values: string[]) => void;
    setError: React.Dispatch<React.SetStateAction<string>>;
    removeValue: (index: number) => void;
    input: Input;
    error: string;
};
export const EditableConstraint: FC<Props> = ({
    constraintChanges,
    localConstraint,
    setLocalConstraint,
    setContextName,
    setOperator,
    onDelete,
    onUndo,
    setInvertedOperator,
    setCaseInsensitive,
    input,
    contextDefinition,
    constraintValues,
    constraintValue,
    setValue,
    setValues,
    setValuesWithRecord,
    setError,
    removeValue,
    error,
}) => {
    const { context } = useUnleashContext();
    const { contextName, operator } = localConstraint;
    const [showCaseSensitiveButton, setShowCaseSensitiveButton] =
        useState(false);

    /* We need a special case to handle the currentTime context field. Since
    this field will be the only one to allow DATE_BEFORE and DATE_AFTER operators
    this will check if the context field is the current time context field AND check
    if it is not already using one of the date operators (to not overwrite if there is existing
    data). */
    useEffect(() => {
        if (
            contextName === CURRENT_TIME_CONTEXT_FIELD &&
            !oneOf(dateOperators, operator)
        ) {
            setLocalConstraint((prev) => ({
                ...prev,
                operator: DATE_AFTER,
                value: new Date().toISOString(),
            }));
        } else if (
            contextName !== CURRENT_TIME_CONTEXT_FIELD &&
            oneOf(dateOperators, operator)
        ) {
            setOperator(IN);
        }

        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }
    }, [contextName, setOperator, operator, setLocalConstraint]);

    if (!context) {
        return null;
    }

    const constraintNameOptions = context.map((context) => {
        return { key: context.name, label: context.name };
    });

    const onOperatorChange = (operator: Operator) => {
        if (oneOf(stringOperators, operator)) {
            setShowCaseSensitiveButton(true);
        } else {
            setShowCaseSensitiveButton(false);
        }

        if (oneOf(dateOperators, operator)) {
            setLocalConstraint((prev) => ({
                ...prev,
                operator: operator,
                value: new Date().toISOString(),
            }));
        } else {
            setOperator(operator);
        }
    };

    const resolveInput = () => {
        switch (input) {
            case IN_OPERATORS_LEGAL_VALUES:
            case STRING_OPERATORS_LEGAL_VALUES:
                return (
                    <>
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
                    </>
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

    return (
        <Container>
            <GeneralSelect
                id='context-field-select'
                name='contextName'
                label='Context Field'
                autoFocus
                options={constraintNameOptions}
                value={contextName || ''}
                onChange={setContextName}
            />
            <ConstraintOperatorSelect
                options={operatorsForContext(contextName)}
                value={operator}
                onChange={onOperatorChange}
            />

            {/*  this is how to style them */}
            {/* <StrategyEvaluationChip label='label' /> */}
            {showCaseSensitiveButton ? (
                <CaseSensitiveButton
                    localConstraint={localConstraint}
                    setCaseInsensitive={setCaseInsensitive}
                />
            ) : null}
            {resolveInput()}
            {/* <ul>
                <li>
                    <Chip
                        label='value1'
                        onDelete={() => console.log('Clicked')}
                    />
                </li>
                <li>
                    <Chip
                        label='value2'
                        onDelete={() => console.log('Clicked')}
                    />
                </li>
            </ul> */}
        </Container>
    );
};
