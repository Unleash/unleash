import { IconButton, styled } from '@mui/material';
import {
    isRegexOperator,
    isStringOperator,
    type Operator,
} from 'constants/operators';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import { operatorsForContext } from 'utils/operatorsForContext';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect.tsx';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import Delete from '@mui/icons-material/Delete';
import type { ValueListHandle } from './ValueList.tsx';
import { ValueListWithOverflow } from './ValueListWithOverflow.tsx';
import { AddValueInline } from './AddValueInline.tsx';
import { AddValueButton } from './AddValueButton.tsx';
import { ToggleConstraintCaseSensitivity } from './ToggleConstraintCaseSensitivity.tsx';
import {
    type LegalValueData,
    useEditableConstraint,
} from './useEditableConstraint/useEditableConstraint.js';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableConstraint as EditableConstraintType,
    isCidrConstraint,
    isMultiValueConstraint,
} from './useEditableConstraint/editable-constraint-type.ts';
import type { ConstraintValidationResult } from './useEditableConstraint/constraint-validator.ts';
import { createContextFieldOptions } from './createContextFieldOptions.ts';
import { ContextFieldSelect } from './ContextFieldSelect.tsx';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';
import { formatTargetRange } from './CidrTargetRange.tsx';
import { getTargetRange } from './useEditableConstraint/ip-address.ts';
import { formatConstraintValue } from 'utils/formatConstraintValue';
import { useLocationSettings } from 'hooks/useLocationSettings';

const invertedDisabledMessages: Partial<Record<Operator, string>> = {
    REGEX: 'The REGEX operator does not support inversion',
};

const getInvertedDisabledText = (
    invertedDisabled: boolean,
    operator: Operator,
): string | undefined => {
    if (!invertedDisabled) return undefined;
    return (
        invertedDisabledMessages[operator] ??
        'This operator does not support inversion'
    );
};

const Container = styled('article')(({ theme }) => ({
    '--padding': theme.spacing(2, 0),
    backgroundColor: theme.palette.background.paper,
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
    localConstraint: EditableConstraintType;
    validator: (...values: string[]) => ConstraintValidationResult;
    addValuesButtonRef: React.RefObject<HTMLButtonElement | null>;
    valueListRef: React.RefObject<ValueListHandle | null>;
    editingOpen: boolean;
    setEditingOpen: (open: boolean) => void;
    toggleValue: (value: string) => void;
    selectedValues: Set<string>;
    legalValueData?: LegalValueData;
}> = ({
    addValues,
    localConstraint,
    validator,
    addValuesButtonRef,
    valueListRef,
    editingOpen,
    setEditingOpen,
    toggleValue,
    selectedValues,
    legalValueData,
}) => {
    const [draftValue, setDraftValue] = useState('');
    const pendingButtonFocus = useRef(false);

    useEffect(() => {
        if (!editingOpen && pendingButtonFocus.current) {
            pendingButtonFocus.current = false;
            // a cancelled edit returns to the chip it was editing; otherwise
            // (no value yet, or multi-value) the add button is still there
            if (
                !isMultiValueConstraint(localConstraint) &&
                localConstraint.value
            ) {
                valueListRef.current?.focusValue(0);
            } else {
                addValuesButtonRef.current?.focus();
            }
        }
    }, [editingOpen, addValuesButtonRef, valueListRef, localConstraint]);

    const existingValue = !isMultiValueConstraint(localConstraint)
        ? localConstraint.value
        : undefined;
    useEffect(() => {
        if (editingOpen && existingValue) {
            setDraftValue(existingValue);
        }
    }, [editingOpen, existingValue]);

    if (
        !isMultiValueConstraint(localConstraint) &&
        localConstraint.value &&
        !editingOpen
    ) {
        return null;
    }

    const closeEditor = (shouldManageFocus: boolean) => {
        if (shouldManageFocus) pendingButtonFocus.current = true;
        setEditingOpen(false);
    };

    return editingOpen ? (
        <AddValueInline
            localConstraint={localConstraint}
            validator={validator}
            onAddValues={(value) => {
                addValues(value);
                if (!isMultiValueConstraint(localConstraint)) {
                    closeEditor(false);
                }
            }}
            value={draftValue}
            onChange={setDraftValue}
            onClose={closeEditor}
            selectedValues={selectedValues}
            toggleValue={toggleValue}
            legalValueData={legalValueData}
        />
    ) : (
        <AddValueButton
            ref={addValuesButtonRef}
            hasValues={selectedValues.size > 0}
            onClick={() => setEditingOpen(true)}
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
    const {
        constraint: localConstraint,
        updateConstraint,
        validator,
        legalValueData,
        selectedValues,
        invertedDisabled,
    } = useEditableConstraint(constraint, onUpdate);
    const [editingOpen, setEditingOpen] = useState(false);

    const valueListRef = useRef<ValueListHandle>(null);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const pendingValueFocus = useRef(false);
    const hasSingleValue =
        !isMultiValueConstraint(localConstraint) &&
        Boolean(localConstraint.value);
    const singleValue = !isMultiValueConstraint(localConstraint)
        ? localConstraint.value
        : undefined;

    const addValues = useCallback(
        (value: string | string[]) => {
            updateConstraint({ type: 'add value(s)', payload: value });
            if (!isMultiValueConstraint(localConstraint)) {
                pendingValueFocus.current = true;
            }
        },
        [updateConstraint, localConstraint],
    );

    useEffect(() => {
        if (!pendingValueFocus.current) return;
        pendingValueFocus.current = false;
        if (singleValue) {
            valueListRef.current?.focusValue(0);
        }
    }, [singleValue]);

    // The add button may not be mounted yet (e.g. single-value constraints)
    const pendingDeleteFocus = useRef(false);

    useEffect(() => {
        if (!pendingDeleteFocus.current || selectedValues.size > 0) return;
        pendingDeleteFocus.current = false;
        addValuesButtonRef.current?.focus();
    }, [selectedValues]);

    const removeValue = useCallback(
        (value: string) => {
            if (selectedValues.size === 1) {
                pendingDeleteFocus.current = true;
            }
            updateConstraint({ type: 'remove value', payload: value });
            setEditingOpen(false);
        },
        [updateConstraint, selectedValues],
    );
    const toggleValue = useCallback(
        (value: string) => {
            updateConstraint({ type: 'toggle value', payload: value });
            pendingValueFocus.current = true;
        },
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
    const { locationSettings } = useLocationSettings();

    const { contextName, operator } = localConstraint;
    const showCaseSensitiveButton =
        isStringOperator(operator) || isRegexOperator(operator);

    if (!context) {
        return null;
    }

    const contextFieldOptions = createContextFieldOptions(
        context,
        localConstraint.contextName,
    );

    const valueTitle = isCidrConstraint(localConstraint)
        ? (value: string) => {
              const range = getTargetRange(value);
              return range
                  ? `Target range: ${formatTargetRange(range)}`
                  : undefined;
          }
        : undefined;

    const formatValue = (value: string) =>
        formatConstraintValue(
            {
                value,
                contextName: localConstraint.contextName,
                operator: localConstraint.operator,
            },
            locationSettings,
        ) ?? value;

    const onEditValue = hasSingleValue ? () => setEditingOpen(true) : undefined;
    const visibleValues =
        hasSingleValue && editingOpen ? [] : Array.from(selectedValues);

    return (
        <Container>
            <TopRow>
                <ConstraintDetails>
                    <ConstraintOptions>
                        <ContextFieldSelect
                            value={contextName || ''}
                            options={contextFieldOptions}
                            onChange={(contextField) =>
                                updateConstraint({
                                    type: 'set context field',
                                    payload: contextField,
                                })
                            }
                        />

                        <OperatorOptions>
                            <ConstraintOperatorSelect
                                contextName={contextName || ''}
                                options={operatorsForContext(contextName)}
                                value={operator}
                                onChange={onOperatorChange}
                                inverted={localConstraint.inverted}
                                onToggleInverted={onToggleInverted}
                                invertedDisabledText={getInvertedDisabledText(
                                    invertedDisabled,
                                    operator,
                                )}
                                showCaseSensitiveButton={
                                    showCaseSensitiveButton
                                }
                                caseInsensitive={Boolean(
                                    localConstraint.caseInsensitive,
                                )}
                                onToggleCaseSensitivity={
                                    onToggleCaseSensitivity
                                }
                            />

                            {showCaseSensitiveButton ? (
                                <ToggleConstraintCaseSensitivity
                                    caseInsensitive={Boolean(
                                        localConstraint.caseInsensitive,
                                    )}
                                    onToggleCaseSensitivity={
                                        onToggleCaseSensitivity
                                    }
                                />
                            ) : null}
                        </OperatorOptions>
                    </ConstraintOptions>
                    <ValueListWithOverflow
                        ref={valueListRef}
                        values={visibleValues}
                        removeValue={removeValue}
                        getValueTitle={valueTitle}
                        getValueLabel={formatValue}
                        getExternalFocusTarget={() => null}
                        onEditValue={onEditValue}
                    >
                        <TopRowInput
                            key={operator}
                            localConstraint={localConstraint}
                            addValues={addValues}
                            validator={validator}
                            addValuesButtonRef={addValuesButtonRef}
                            valueListRef={valueListRef}
                            editingOpen={editingOpen}
                            setEditingOpen={setEditingOpen}
                            toggleValue={toggleValue}
                            selectedValues={selectedValues}
                            legalValueData={legalValueData}
                        />
                    </ValueListWithOverflow>
                </ConstraintDetails>
                <ButtonPlaceholder />
                <HtmlTooltip title='Delete constraint' arrow>
                    <StyledIconButton
                        type='button'
                        data-testid='DELETE_CONSTRAINT_BUTTON'
                        size='medium'
                        onClick={onDelete}
                        ref={deleteButtonRef}
                    >
                        <Delete />
                    </StyledIconButton>
                </HtmlTooltip>
            </TopRow>
        </Container>
    );
};
