import { IconButton, styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import type { Input } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/useConstraintInput/useConstraintInput';
import {
    DATE_AFTER,
    dateOperators,
    IN,
    stringOperators,
    type Operator,
} from 'constants/operators';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import type { IUnleashContextDefinition } from 'interfaces/context';
import type { IConstraint } from 'interfaces/strategy';
import { useEffect, useRef, useState, type FC } from 'react';
import { oneOf } from 'utils/oneOf';
import {
    CURRENT_TIME_CONTEXT_FIELD,
    operatorsForContext,
} from 'utils/operatorsForContext';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import Delete from '@mui/icons-material/Delete';
import { ValueList } from './ValueList';
import { ReactComponent as CaseSensitiveIcon } from 'assets/icons/case-sensitive.svg';
import { ReactComponent as CaseInsensitiveIcon } from 'assets/icons/case-insensitive.svg';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import { AddValuesWidget } from './AddValuesWidget';

import { ReactComponent as EqualsIcon } from 'assets/icons/constraint-equals.svg';
import { ReactComponent as NotEqualsIcon } from 'assets/icons/constraint-not-equals.svg';
import { AddSingleValueWidget } from './AddSingleValueWidget';
import { ConstraintDateInput } from './ConstraintDateInput';
import { LegalValuesSelector } from './LegalValuesSelector';
import { resolveLegalValues } from './resolve-legal-values';

const Container = styled('article')(({ theme }) => ({
    '--padding': theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
}));

const TopRow = styled('div')(({ theme }) => ({
    '--gap': theme.spacing(1),
    padding: 'var(--padding)',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'flex-start',
    justifyItems: 'space-between',
    gap: 'var(--gap)',
}));

const ConstraintOptions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: 'var(--gap)',
    alignSelf: 'flex-start',
}));

const OperatorOptions = styled(ConstraintOptions)(({ theme }) => ({
    flexFlow: 'row wrap',
}));

const ConstraintDetails = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: 'var(--gap)',
    flexFlow: 'row wrap',
    width: '100%',
    height: 'min-content',
}));

const LegalValuesContainer = styled('div')(({ theme }) => ({
    padding: 'var(--padding)',
    borderTop: `1px dashed ${theme.palette.divider}`,
}));

const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    fieldset: { border: 'none', borderRadius: 0 },
    maxWidth: '25ch',
    ':focus-within .MuiSelect-select': {
        background: 'none',
    },
    ':focus-within fieldset': { borderBottomStyle: 'solid' },
    'label + &': {
        // mui adds a margin top to 'standard' selects with labels
        margin: 0,
    },
    '&::before': {
        border: 'none',
    },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1),
}));

const StyledButton = styled('button')(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    borderRadius: theme.shape.borderRadius,
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

const StyledEqualsIcon = styled(EqualsIcon)(({ theme }) => ({
    path: {
        fill: 'currentcolor',
    },
}));

const StyledNotEqualsIcon = styled(NotEqualsIcon)(({ theme }) => ({
    path: {
        fill: theme.palette.text.disabled,
    },
    rect: {
        fill: theme.palette.text.secondary,
    },
}));

const ButtonPlaceholder = styled('div')(({ theme }) => ({
    // this is a trick that lets us use absolute positioning for the button so
    // that it can go over the operator context fields when necessary (narrow
    // screens), but still retain necessary space for the button when it's all
    // on one line.
    width: theme.spacing(2),
}));

const StyledCaseInsensitiveIcon = styled(CaseInsensitiveIcon)(({ theme }) => ({
    path: {
        fill: theme.palette.text.disabled,
    },
    rect: {
        fill: theme.palette.text.secondary,
    },
}));
const StyledCaseSensitiveIcon = styled(CaseSensitiveIcon)(({ theme }) => ({
    fill: 'currentcolor',
}));

type InputType =
    | { input: 'legal values' }
    | { input: 'date' }
    | { input: 'single value'; type: 'number' | 'semver' }
    | { input: 'multiple values' };

const getInputType = (input: Input): InputType => {
    switch (input) {
        case 'IN_OPERATORS_LEGAL_VALUES':
        case 'STRING_OPERATORS_LEGAL_VALUES':
        case 'NUM_OPERATORS_LEGAL_VALUES':
        case 'SEMVER_OPERATORS_LEGAL_VALUES':
            return { input: 'legal values' };
        case 'DATE_OPERATORS_SINGLE_VALUE':
            return { input: 'date' };
        case 'NUM_OPERATORS_SINGLE_VALUE':
            return { input: 'single value', type: 'number' };
        case 'SEMVER_OPERATORS_SINGLE_VALUE':
            return { input: 'single value', type: 'semver' };
        case 'IN_OPERATORS_FREETEXT':
        case 'STRING_OPERATORS_FREETEXT':
            return { input: 'multiple values' };
    }
};

type Props = {
    constraint: IConstraint;
    localConstraint: IConstraint;
    setContextName: (contextName: string) => void;
    setOperator: (operator: Operator) => void;
    setLocalConstraint: React.Dispatch<React.SetStateAction<IConstraint>>;
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
    constraint,
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
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);
    const inputType = getInputType(input);

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

    const TopRowInput = () => {
        switch (inputType.input) {
            case 'date':
                return (
                    <ConstraintDateInput
                        setValue={setValue}
                        value={localConstraint.value}
                        error={error}
                        setError={setError}
                    />
                );
            case 'single value':
                return (
                    <AddSingleValueWidget
                        onAddValue={(newValue) => {
                            setValue(newValue);
                        }}
                        removeValue={() => setValue('')}
                        currentValue={localConstraint.value}
                        helpText={
                            inputType.type === 'number'
                                ? 'Add a single number'
                                : 'A semver value should be of the format X.Y.Z'
                        }
                        inputType={
                            inputType.type === 'number' ? 'number' : 'text'
                        }
                    />
                );
            case 'multiple values':
                return (
                    <AddValuesWidget
                        helpText='Maximum 100 char length per value'
                        ref={addValuesButtonRef}
                        onAddValues={(newValues) => {
                            // todo (`addEditStrategy`): move deduplication logic higher up in the context handling
                            const combinedValues = new Set([
                                ...(localConstraint.values || []),
                                ...newValues,
                            ]);
                            setValuesWithRecord(Array.from(combinedValues));
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Container>
            <TopRow>
                <ConstraintDetails>
                    <ConstraintOptions>
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

                        <OperatorOptions>
                            <StyledButton
                                type='button'
                                onClick={toggleInvertedOperator}
                            >
                                {localConstraint.inverted ? (
                                    <StyledNotEqualsIcon aria-label='The constraint operator is exclusive.' />
                                ) : (
                                    <StyledEqualsIcon aria-label='The constraint operator is inclusive.' />
                                )}
                                <ScreenReaderOnly>
                                    Make the selected operator
                                    {localConstraint.inverted
                                        ? ' inclusive'
                                        : ' exclusive'}
                                </ScreenReaderOnly>
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
                                    {localConstraint.caseInsensitive ? (
                                        <StyledCaseInsensitiveIcon aria-label='The match is not case sensitive.' />
                                    ) : (
                                        <StyledCaseSensitiveIcon aria-label='The match is case sensitive.' />
                                    )}
                                    <ScreenReaderOnly>
                                        Make match
                                        {localConstraint.caseInsensitive
                                            ? ' '
                                            : ' not '}
                                        case sensitive
                                    </ScreenReaderOnly>
                                </StyledButton>
                            ) : null}
                        </OperatorOptions>
                    </ConstraintOptions>
                    <ValueList
                        values={localConstraint.values}
                        removeValue={removeValue}
                        setValues={setValuesWithRecord}
                        getExternalFocusTarget={() =>
                            addValuesButtonRef.current ??
                            deleteButtonRef.current
                        }
                    >
                        <TopRowInput />
                    </ValueList>
                </ConstraintDetails>
                <ButtonPlaceholder />
                <HtmlTooltip title='Delete constraint' arrow>
                    <StyledIconButton
                        type='button'
                        data-testid='DELETE_CONSTRAINT_BUTTON'
                        size='small'
                        onClick={onDelete}
                        ref={deleteButtonRef}
                    >
                        <Delete fontSize='inherit' />
                    </StyledIconButton>
                </HtmlTooltip>
            </TopRow>
            {inputType.input === 'legal values' ? (
                <LegalValuesContainer>
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
                </LegalValuesContainer>
            ) : null}
        </Container>
    );
};
