import { IconButton, Link, styled } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import {
    isRegexOperator,
    isStringOperator,
    type Operator,
} from 'constants/operators';
import { useCallback, useRef, type FC } from 'react';
import { operatorsForContext } from 'utils/operatorsForContext';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect.tsx';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import Delete from '@mui/icons-material/Delete';
import { ValueList } from './ValueList.tsx';
import { AddValuesWidget } from './AddValuesWidget.tsx';
import { ToggleConstraintCaseSensitivity } from './ToggleConstraintCaseSensitivity.tsx';

import { AddSingleValueWidget } from './AddSingleValueWidget.tsx';
import { ConstraintDateInput } from './ConstraintDateInput.tsx';
import {
    LegalValuesSelector,
    SingleLegalValueSelector,
} from './LegalValuesSelector.tsx';
import { useEditableConstraint } from './useEditableConstraint/useEditableConstraint.js';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableConstraint as EditableConstraintType,
    isDateConstraint,
    isMultiValueConstraint,
    isNumberConstraint,
    isRegexConstraint,
    isSemVerConstraint,
} from './useEditableConstraint/editable-constraint-type.ts';
import type { ConstraintValidationResult } from './useEditableConstraint/constraint-validator.ts';
import { useUiFlag } from 'hooks/useUiFlag.ts';
import { createContextFieldOptions } from './createContextFieldOptions.ts';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';
import { AddRegexConstraintValueWidget } from './AddRegexConstraintValueWidget.tsx';
import { ToggleConstraintInverted } from '../ToggleConstraintInverted.tsx';

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
    minWidth: '7ch',
    ':focus-within .MuiSelect-select': {
        background: 'none',
    },
    ':focus-within fieldset': { borderBottomStyle: 'solid' },
    'label + &': {
        // mui adds a margin top to 'standard' selects with labels
        margin: 0,
    },
    '&::before': {
        borderColor: theme.palette.divider,
    },
    '&&:hover::before': {
        borderColor: theme.palette.primary.main,
    },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1),
}));

const ButtonPlaceholder = styled('div')(({ theme }) => ({
    // this is a trick that lets us use absolute positioning for the button so
    // that it can go over the operator context fields when necessary (narrow
    // screens), but still retain necessary space for the button when it's all
    // on one line.
    width: theme.spacing(2),
}));

const TopRowInput: FC<{
    addValues: (value: string | string[]) => void;
    clearValues: () => void;
    localConstraint: EditableConstraintType;
    validator: (value: string) => ConstraintValidationResult;
    addValuesButtonRef: React.RefObject<HTMLButtonElement>;
    onToggleCaseSensitivity: () => void;
    onToggleInverted: () => void;
}> = ({
    addValues,
    clearValues,
    localConstraint,
    validator,
    addValuesButtonRef,
    onToggleCaseSensitivity,
    onToggleInverted,
}) => {
    if (isDateConstraint(localConstraint)) {
        return (
            <ConstraintDateInput
                setValue={addValues}
                value={localConstraint.value}
                validator={validator}
            />
        );
    }
    if (isSemVerConstraint(localConstraint)) {
        return (
            <AddSingleValueWidget
                validator={validator}
                onAddValue={addValues}
                removeValue={clearValues}
                currentValue={localConstraint.value}
                helpText={'A semver value should be of the format X.Y.Z'}
                inputType={'text'}
            />
        );
    }
    if (isRegexConstraint(localConstraint)) {
        return (
            <AddRegexConstraintValueWidget
                validator={validator}
                onAddValue={addValues}
                removeValue={clearValues}
                currentValue={localConstraint.value}
                caseInsensitive={!!localConstraint.caseInsensitive}
                inverted={!!localConstraint.inverted}
                onToggleCaseSensitivity={onToggleCaseSensitivity}
                onToggleInverted={onToggleInverted}
                helpText={
                    <>
                        A regex value should be a valid{' '}
                        <Link
                            href='https://github.com/google/re2/wiki/Syntax'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.25,
                            }}
                        >
                            RE2 regular expression
                            <OpenInNew sx={{ fontSize: 'inherit' }} />
                        </Link>
                    </>
                }
            />
        );
    }
    if (isNumberConstraint(localConstraint)) {
        return (
            <AddSingleValueWidget
                validator={validator}
                onAddValue={addValues}
                removeValue={clearValues}
                currentValue={localConstraint.value}
                helpText={'Add a single number'}
                inputType={'number'}
            />
        );
    }

    return (
        <AddValuesWidget
            validator={validator}
            helpText='Maximum 100 char length per value'
            ref={addValuesButtonRef}
            onAddValues={addValues}
        />
    );
};

type Props = {
    constraint: IConstraint;
    onDelete: () => void;
    onUpdate: (constraint: IConstraint) => void;
};

export const EditableConstraint: FC<Props> = ({
    onDelete,
    constraint,
    onUpdate,
}) => {
    const groupContextFieldOptionsByType = useUiFlag('projectContextFields');
    const {
        constraint: localConstraint,
        updateConstraint,
        validator,
        legalValueData,
    } = useEditableConstraint(constraint, onUpdate);
    const addValues = useCallback(
        (value: string | string[]) =>
            updateConstraint({ type: 'add value(s)', payload: value }),
        [updateConstraint],
    );
    const removeValue = useCallback(
        (value: string) =>
            updateConstraint({ type: 'remove value', payload: value }),
        [updateConstraint],
    );
    const clearAll = useCallback(
        () => updateConstraint({ type: 'clear values' }),
        [updateConstraint],
    );
    const toggleValue = useCallback(
        (value: string) =>
            updateConstraint({ type: 'toggle value', payload: value }),
        [updateConstraint],
    );
    const onOperatorChange = useCallback(
        (operator: Operator) => {
            updateConstraint({ type: 'set operator', payload: operator });
        },
        [updateConstraint],
    );

    const onToggleInverted = useCallback(
        () => updateConstraint({ type: 'toggle inverted operator' }),
        [updateConstraint],
    );

    const onToggleCaseSensitivity = useCallback(() => {
        updateConstraint({ type: 'toggle case sensitivity' });
    }, [updateConstraint]);

    const { context } = useAssignableUnleashContext();

    const { contextName, operator } = localConstraint;
    const showCaseSensitiveButton =
        isStringOperator(operator) || isRegexOperator(operator);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);

    if (!context) {
        return null;
    }

    const contextFieldOptions = createContextFieldOptions(
        localConstraint,
        context,
        { groupOptions: groupContextFieldOptionsByType },
    );

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
                            options={contextFieldOptions}
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
                            <ToggleConstraintInverted
                                inverted={localConstraint.inverted}
                                onToggleInverted={onToggleInverted}
                            />

                            <ConstraintOperatorSelect
                                options={operatorsForContext(contextName)}
                                value={operator}
                                onChange={onOperatorChange}
                                inverted={localConstraint.inverted}
                            />

                            {showCaseSensitiveButton ? (
                                <ToggleConstraintCaseSensitivity
                                    caseInsensitive={
                                        !!localConstraint.caseInsensitive
                                    }
                                    onToggleCaseSensitivity={
                                        onToggleCaseSensitivity
                                    }
                                />
                            ) : null}
                        </OperatorOptions>
                    </ConstraintOptions>
                    <ValueList
                        values={
                            isMultiValueConstraint(localConstraint)
                                ? Array.from(localConstraint.values)
                                : legalValueData && localConstraint.value
                                  ? [localConstraint.value]
                                  : undefined
                        }
                        removeValue={removeValue}
                        getExternalFocusTarget={() =>
                            addValuesButtonRef.current ??
                            deleteButtonRef.current
                        }
                    >
                        {legalValueData ? null : (
                            <TopRowInput
                                localConstraint={localConstraint}
                                addValues={addValues}
                                clearValues={clearAll}
                                validator={validator}
                                addValuesButtonRef={addValuesButtonRef}
                                onToggleCaseSensitivity={
                                    onToggleCaseSensitivity
                                }
                                onToggleInverted={onToggleInverted}
                            />
                        )}
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
            {legalValueData ? (
                <LegalValuesContainer>
                    {isMultiValueConstraint(localConstraint) ? (
                        <LegalValuesSelector
                            values={localConstraint.values}
                            toggleValue={toggleValue}
                            clearAll={clearAll}
                            addValues={addValues}
                            {...legalValueData}
                        />
                    ) : (
                        <SingleLegalValueSelector
                            toggleValue={toggleValue}
                            value={localConstraint.value}
                            {...legalValueData}
                        />
                    )}
                </LegalValuesContainer>
            ) : null}
        </Container>
    );
};
