import { Chip, type ChipProps, IconButton, styled } from '@mui/material';
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
import { forwardRef, useEffect, useRef, useState, type FC } from 'react';
import { oneOf } from 'utils/oneOf';
import {
    CURRENT_TIME_CONTEXT_FIELD,
    operatorsForContext,
} from 'utils/operatorsForContext';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import Clear from '@mui/icons-material/Clear';

const Container = styled('article')(({ theme }) => ({
    '--padding': theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const TopRow = styled('div')(({ theme }) => ({
    padding: 'var(--padding)',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
    justifyItems: 'space-between',
    borderBottom: `1px dashed ${theme.palette.divider}`,
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

const ConstraintDetails = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    flexFlow: 'row nowrap',
    width: '100%',
    height: 'min-content',
}));

const InputContainer = styled('div')(({ theme }) => ({
    padding: 'var(--padding)',
    paddingTop: 0,
}));

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    fieldset: { border: 'none', borderRadius: 0 },
    ':focus-within fieldset': { borderBottomStyle: 'solid' },
    'label + &': {
        // mui adds a margin top to 'standard' selects with labels
        margin: 0,
    },
    '&::before': {
        border: 'none',
    },
}));

const StyledButton = styled('button')(({ theme }) => ({
    width: '5ch',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0),
    fontSize: theme.fontSizes.smallerBody,
    background: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    color: theme.palette.secondary.dark,
    fontWeight: theme.typography.fontWeightBold,
    transition: 'all 0.03s ease',
    '&:is(:hover, :focus-visible)': {
        outline: `1px solid ${theme.palette.primary.main}`,
    },
}));

const ValueListWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(1),
}));

const ValueList = styled('ul')({
    listStyle: 'none',
    padding: 0,
    display: 'contents',
});

const ValueChipBase = styled(
    forwardRef<HTMLDivElement, ChipProps>((props, ref) => (
        <Chip size='small' {...props} ref={ref} />
    )),
)(({ theme }) => ({
    transition: 'all 0.3s ease',
    outline: `1px solid #0000`,
    background: theme.palette.background.elevation1,
    ':hover, :focus-visible': {
        background: theme.palette.background.elevation1,
    },
    ':focus-visible': {
        outlineColor: theme.palette.secondary.dark,
    },
}));
const ValueChip = styled(ValueChipBase)(({ theme }) => ({
    svg: {
        fill: theme.palette.secondary.dark,
        borderRadius: '50%',
        outline: `2px solid #0000`,
        transition: 'inherit',
        ':focus-visible,:hover': {
            backgroundColor: theme.palette.table.headerHover,
            outlineColor: theme.palette.table.headerHover,
        },
    },
}));

const AddValuesButton = styled(ValueChipBase)(({ theme }) => ({
    color: theme.palette.primary.main,
    svg: {
        fill: theme.palette.primary.main,
        height: theme.fontSizes.smallerBody,
        width: theme.fontSizes.smallerBody,
    },
    ':hover': {
        outlineColor: theme.palette.secondary.dark,
    },
}));

type Props = {
    localConstraint: IConstraint;
    setContextName: (contextName: string) => void;
    setOperator: (operator: Operator) => void;
    setLocalConstraint: React.Dispatch<React.SetStateAction<IConstraint>>;
    action: string;
    onDelete?: () => void;
    toggleInvertedOperator: () => void;
    toggleCaseSensitivity: () => void;
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
    toggleInvertedOperator,
    toggleCaseSensitivity,
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

    const constraintElementRefs: React.MutableRefObject<
        (HTMLDivElement | null)[]
    > = useRef([]);
    const addValueRef = useRef(null);

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

    const Input = () => {
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

    const localConstraintValues = localConstraint.values || [];

    return (
        <Container>
            <TopRow>
                <ConstraintDetails>
                    <StyledSelect
                        visuallyHideLabel
                        id='context-field-select'
                        name='contextName'
                        label='Context Field'
                        autoFocus
                        options={constraintNameOptions}
                        value={contextName || ''}
                        onChange={setContextName}
                        variant='standard'
                    />

                    <StyledButton
                        type='button'
                        onClick={toggleInvertedOperator}
                    >
                        {localConstraint.inverted ? 'aint' : 'is'}
                    </StyledButton>

                    <ConstraintOperatorSelect
                        options={operatorsForContext(contextName)}
                        value={operator}
                        onChange={onOperatorChange}
                        inverted={localConstraint.inverted}
                    />

                    {showCaseSensitiveButton ? (
                        <StyledButton
                            type='button'
                            onClick={toggleCaseSensitivity}
                        >
                            {localConstraint.caseInsensitive ? 'Aa' : 'A/a'}
                        </StyledButton>
                    ) : null}
                </ConstraintDetails>
                <ValueListWrapper>
                    <ValueList>
                        {localConstraintValues.map((value, index) => (
                            <li key={value}>
                                <ValueChip
                                    ref={(el) => {
                                        constraintElementRefs.current[index] =
                                            el;
                                    }}
                                    deleteIcon={<Clear />}
                                    label={value}
                                    onDelete={() => {
                                        const nextFocus = () => {
                                            if (
                                                index ===
                                                localConstraintValues.length - 1
                                            ) {
                                                if (index === 0) {
                                                    return addValueRef.current;
                                                } else {
                                                    return constraintElementRefs
                                                        .current[index - 1];
                                                }
                                            } else {
                                                return constraintElementRefs
                                                    .current[index + 1];
                                            }
                                        };
                                        nextFocus()?.focus();
                                        removeValue(index);
                                    }}
                                />
                            </li>
                        ))}
                    </ValueList>
                    <AddValuesButton
                        ref={addValueRef}
                        label={'Add values'}
                        onClick={() => console.log('adding values')}
                        icon={<Add />}
                    />
                </ValueListWrapper>

                <HtmlTooltip title='Delete constraint' arrow>
                    <IconButton type='button' size='small' onClick={onDelete}>
                        <Delete />
                    </IconButton>
                </HtmlTooltip>
            </TopRow>
            <InputContainer>
                <Input />
            </InputContainer>
        </Container>
    );
};
