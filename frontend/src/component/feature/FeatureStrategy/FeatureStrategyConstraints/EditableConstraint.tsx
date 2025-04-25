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
import { ResolveInput } from 'component/common/NewConstraintAccordion/ConstraintAccordionEdit/ConstraintAccordionEditBody/ResolveInput/ResolveInput';

const Container = styled('article')(({ theme }) => ({
    '--padding': theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px solid ${theme.palette.divider}`,
    containerType: 'inline-size',
}));

const onNarrowContainer = '@container (max-width: 700px)';

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
    flexFlow: 'row nowrap',
    gap: 'var(--gap)',
    alignSelf: 'flex-start',
    [onNarrowContainer]: {
        flexFlow: 'row wrap',
    },
}));

const OperatorOptions = styled(ConstraintOptions)(({ theme }) => ({
    flexFlow: 'row nowrap',
}));

const ConstraintDetails = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: 'var(--gap)',
    flexFlow: 'row nowrap',
    width: '100%',
    height: 'min-content',
    [onNarrowContainer]: {
        flexDirection: 'column',
    },
}));

const InputContainer = styled('div')(({ theme }) => ({
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
    // todo (`addEditStrategy`): this is pretty rough, but it needs to be the
    // same height as the input fields, which are 27.25 px at the moment.
    // Consider editing this when we get new icons for the buttons. There may be
    // a better solution.
    height: `calc(${theme.typography.body1.fontSize} + ${theme.spacing(1.5)})`,
    width: '5ch',
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

const CaseButton = styled(StyledButton)(({ theme }) => ({
    display: 'grid',
    placeItems: 'center',
}));

const OPERATORS_WITH_ADD_VALUES_WIDGET = [
    'IN_OPERATORS_FREETEXT',
    'STRING_OPERATORS_FREETEXT',
];

type Props = {
    constraint: IConstraint;
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
    const showAddValuesButton =
        OPERATORS_WITH_ADD_VALUES_WIDGET.includes(input);
    const showInputField = !showAddValuesButton;

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
                                {localConstraint.inverted ? 'aint' : 'is'}
                            </StyledButton>

                            <ConstraintOperatorSelect
                                options={operatorsForContext(contextName)}
                                value={operator}
                                onChange={onOperatorChange}
                                inverted={localConstraint.inverted}
                            />

                            {showCaseSensitiveButton ? (
                                <CaseButton
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
                                </CaseButton>
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
                        {showAddValuesButton ? (
                            <AddValuesWidget
                                ref={addValuesButtonRef}
                                onAddValues={(newValues) => {
                                    // todo (`addEditStrategy`): move deduplication logic higher up in the context handling
                                    const combinedValues = new Set([
                                        ...(localConstraint.values || []),
                                        ...newValues,
                                    ]);
                                    setValuesWithRecord(
                                        Array.from(combinedValues),
                                    );
                                }}
                            />
                        ) : null}
                    </ValueList>
                </ConstraintDetails>
                <ButtonPlaceholder />
                <HtmlTooltip title='Delete constraint' arrow>
                    <StyledIconButton
                        type='button'
                        size='small'
                        onClick={onDelete}
                        ref={deleteButtonRef}
                    >
                        <Delete fontSize='inherit' />
                    </StyledIconButton>
                </HtmlTooltip>
            </TopRow>
            {showInputField ? (
                <InputContainer>
                    <ResolveInput
                        setValues={setValues}
                        setValuesWithRecord={setValuesWithRecord}
                        setValue={setValue}
                        setError={setError}
                        localConstraint={localConstraint}
                        constraintValues={constraint?.values || []}
                        constraintValue={constraint?.value || ''}
                        input={input}
                        error={error}
                        contextDefinition={contextDefinition}
                        removeValue={removeValue}
                    />
                </InputContainer>
            ) : null}
        </Container>
    );
};
