import { IconButton, styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { isStringOperator, type Operator } from 'constants/operators';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';
import { useRef, type FC } from 'react';
import { operatorsForContext } from 'utils/operatorsForContext';
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
import { useEditableConstraint } from './useEditableConstraint/useEditableConstraint';
import type { IConstraint } from 'interfaces/strategy';
import {
    isDateConstraint,
    isMultiValueConstraint,
    isNumberConstraint,
    isSemVerConstraint,
    isSingleValueConstraint,
} from './useEditableConstraint/editable-constraint-type';

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
    // fontSize: theme.typography.body1.fontSize
    fontSize: theme.fontSizes.extraLargeHeader,
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

type Props = {
    constraint: IConstraint;
    onDelete: () => void;
    onAutoSave: (constraint: IConstraint) => void;
};

export const EditableConstraint: FC<Props> = ({
    onDelete,
    constraint,
    onAutoSave,
}) => {
    const {
        constraint: localConstraint,
        updateConstraint,
        validator,
        ...constraintMetadata
    } = useEditableConstraint(constraint, onAutoSave);

    const { context } = useUnleashContext();
    const { contextName, operator } = localConstraint;
    const showCaseSensitiveButton = isStringOperator(operator);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);

    if (!context) {
        return null;
    }

    const constraintNameOptions = context.map((context) => {
        return { key: context.name, label: context.name };
    });

    const onOperatorChange = (operator: Operator) => {
        updateConstraint({ type: 'set operator', payload: operator });
    };

    const TopRowInput = () => {
        if (isSingleValueConstraint(localConstraint)) {
            if (isDateConstraint(localConstraint)) {
                return (
                    <ConstraintDateInput
                        setValue={(value: string) =>
                            updateConstraint({
                                type: 'set value',
                                payload: value,
                            })
                        }
                        value={localConstraint.value}
                        validator={validator}
                    />
                );
            }
            if (isSemVerConstraint(localConstraint)) {
                return (
                    <AddSingleValueWidget
                        validator={validator}
                        onAddValue={(newValue) => {
                            updateConstraint({
                                type: 'set value',
                                payload: newValue,
                            });
                        }}
                        removeValue={() =>
                            updateConstraint({ type: 'clear values' })
                        }
                        currentValue={localConstraint.value}
                        helpText={
                            'A semver value should be of the format X.Y.Z'
                        }
                        inputType={'text'}
                    />
                );
            }
            if (isNumberConstraint(localConstraint)) {
                return (
                    <AddSingleValueWidget
                        validator={validator}
                        onAddValue={(newValue) => {
                            updateConstraint({
                                type: 'set value',
                                payload: newValue,
                            });
                        }}
                        removeValue={() =>
                            updateConstraint({ type: 'clear values' })
                        }
                        currentValue={localConstraint.value}
                        helpText={'Add a single number'}
                        inputType={'number'}
                    />
                );
            }
        }

        return (
            <AddValuesWidget
                validator={validator}
                helpText='Maximum 100 char length per value'
                ref={addValuesButtonRef}
                onAddValues={(newValues) => {
                    updateConstraint({
                        type: 'add value(s)',
                        payload: newValues,
                    });
                }}
            />
        );
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
                            onChange={(contextField) =>
                                updateConstraint({
                                    type: 'set context field',
                                    payload: contextField,
                                })
                            }
                            variant='standard'
                        />

                        <OperatorOptions>
                            <StyledButton
                                type='button'
                                onClick={() =>
                                    updateConstraint({
                                        type: 'toggle inverted operator',
                                    })
                                }
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
                                    onClick={() =>
                                        updateConstraint({
                                            type: 'toggle case sensitivity',
                                        })
                                    }
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
                        values={
                            isMultiValueConstraint(localConstraint)
                                ? Array.from(localConstraint.values)
                                : undefined
                        }
                        removeValue={(value) =>
                            updateConstraint({
                                type: 'remove value from list',
                                payload: value,
                            })
                        }
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
            {'legalValues' in constraintMetadata &&
            isMultiValueConstraint(localConstraint) ? (
                <LegalValuesContainer>
                    <LegalValuesSelector
                        values={localConstraint.values || new Set()}
                        clearAll={() =>
                            updateConstraint({
                                type: 'clear values',
                            })
                        }
                        addValues={(newValues) =>
                            updateConstraint({
                                type: 'add value(s)',
                                payload: newValues,
                            })
                        }
                        removeValue={(value) =>
                            updateConstraint({
                                type: 'remove value from list',
                                payload: value,
                            })
                        }
                        deletedLegalValues={
                            constraintMetadata.deletedLegalValues
                        }
                        legalValues={constraintMetadata.legalValues}
                    />
                </LegalValuesContainer>
            ) : null}
        </Container>
    );
};
