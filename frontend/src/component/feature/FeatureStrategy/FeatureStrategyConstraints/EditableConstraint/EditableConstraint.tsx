import { IconButton, Link, styled } from '@mui/material';
import OpenInNew from '@mui/icons-material/OpenInNew';
import {
    isRegexOperator,
    isStringOperator,
    type Operator,
} from 'constants/operators';
import { useCallback, useRef, useState, type FC } from 'react';
import { operatorsForContext } from 'utils/operatorsForContext';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect.tsx';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import Delete from '@mui/icons-material/Delete';
import { ValueList } from './ValueList.tsx';
import { AddValueInline } from './AddValueInline.tsx';
import { AddValueButton } from './AddValueButton.tsx';
import { ToggleConstraintCaseSensitivity } from './ToggleConstraintCaseSensitivity.tsx';
import { ConstraintDateInput } from './ConstraintDateInput.tsx';
import {
    LegalValuesSelector,
    SingleLegalValueSelector,
} from './LegalValuesSelector.tsx';
import {
    type LegalValueData,
    useEditableConstraint,
} from './useEditableConstraint/useEditableConstraint.js';
import type { IConstraint } from 'interfaces/strategy';
import {
    type EditableConstraint as EditableConstraintType,
    isCidrConstraint,
    isDateConstraint,
    isMultiValueConstraint,
    isRegexConstraint,
} from './useEditableConstraint/editable-constraint-type.ts';
import type { ConstraintValidationResult } from './useEditableConstraint/constraint-validator.ts';
import { createContextFieldOptions } from './createContextFieldOptions.ts';
import { ContextFieldSelect } from './ContextFieldSelect.tsx';
import { useAssignableUnleashContext } from 'hooks/api/getters/useUnleashContext/useAssignableUnleashContext.ts';
import { AddRegexValueEditor } from './AddRegexValueEditor/AddRegexValueEditor.tsx';
import { CidrSdkRequirements } from './CidrSdkRequirements.tsx';
import { formatTargetRange } from './CidrTargetRange.tsx';
import { getTargetRange } from './useEditableConstraint/ip-address.ts';

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

const LegalValuesContainer = styled('div')(({ theme }) => ({
    padding: 'var(--padding)',
    borderTop: `1px dashed ${theme.palette.divider}`,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1),
}));

const StyledHelpLink = styled(Link)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
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
    validator: (value: string) => ConstraintValidationResult;
    addValuesButtonRef: React.RefObject<HTMLDivElement | null>;
    editingOpen: boolean;
    setEditingOpen: (open: boolean) => void;
}> = ({
    addValues,
    localConstraint,
    validator,
    addValuesButtonRef,
    editingOpen,
    setEditingOpen,
}) => {
    const [draftValue, setDraftValue] = useState('');

    if (isDateConstraint(localConstraint)) {
        return (
            <ConstraintDateInput
                setValue={addValues}
                value={localConstraint.value}
                validator={validator}
            />
        );
    }

    if (!isMultiValueConstraint(localConstraint) && localConstraint.value) {
        return null;
    }

    if (isRegexConstraint(localConstraint)) {
        if (editingOpen) return null;
        return (
            <AddValueButton
                hasValues={false}
                onClick={() => setEditingOpen(true)}
            />
        );
    }

    const hasValues =
        isMultiValueConstraint(localConstraint) &&
        localConstraint.values.size > 0;

    return (
        <div ref={addValuesButtonRef}>
            {editingOpen ? (
                <AddValueInline
                    localConstraint={localConstraint}
                    validator={validator}
                    onAddValues={addValues}
                    value={draftValue}
                    onChange={setDraftValue}
                    onClose={() => setEditingOpen(false)}
                />
            ) : (
                <AddValueButton
                    hasValues={hasValues}
                    onClick={() => setEditingOpen(true)}
                />
            )}
        </div>
    );
};

const InlineEdit: FC<{
    addValues: (value: string | string[]) => void;
    localConstraint: EditableConstraintType;
    editingOpen: boolean;
    legalValueData?: LegalValueData;
    toggleValue: (value: string) => void;
    clearAll: () => void;
    validator: (value: string) => ConstraintValidationResult;
}> = ({
    addValues,
    localConstraint,
    legalValueData,
    toggleValue,
    clearAll,
    editingOpen,
    validator,
}) => {
    if (legalValueData) {
        return (
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
        );
    }

    if (isRegexConstraint(localConstraint) && editingOpen) {
        return (
            <AddRegexValueEditor
                initialValue={localConstraint.value}
                caseInsensitive={Boolean(localConstraint.caseInsensitive)}
                addValue={addValues}
                validator={validator}
                editingOpen={editingOpen}
                helpText={
                    <>
                        A regex value should be a valid{' '}
                        <StyledHelpLink
                            href='https://github.com/google/re2/wiki/Syntax'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            RE2 regular expression
                            <OpenInNew sx={{ fontSize: 'inherit' }} />
                        </StyledHelpLink>
                    </>
                }
            />
        );
    }
    return null;
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
        invertedDisabled,
        currentValueInvalid,
    } = useEditableConstraint(constraint, onUpdate);
    const [editingRequested, setEditingOpen] = useState(false);
    const editingOpen =
        editingRequested ||
        (isRegexConstraint(localConstraint) && currentValueInvalid);

    const addValues = useCallback(
        (value: string | string[]) =>
            updateConstraint({ type: 'add value(s)', payload: value }),
        [updateConstraint],
    );
    const removeValue = useCallback(
        (value: string) => {
            updateConstraint({ type: 'remove value', payload: value });
            setEditingOpen(false);
        },
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
    const addValuesButtonRef = useRef<HTMLDivElement>(null);

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
                    <ValueList
                        values={
                            isMultiValueConstraint(localConstraint)
                                ? Array.from(localConstraint.values)
                                : localConstraint.value
                                  ? [localConstraint.value]
                                  : undefined
                        }
                        removeValue={removeValue}
                        getValueTitle={valueTitle}
                        getExternalFocusTarget={() =>
                            addValuesButtonRef.current ??
                            deleteButtonRef.current
                        }
                    >
                        {legalValueData ? null : (
                            <TopRowInput
                                key={operator}
                                localConstraint={localConstraint}
                                addValues={addValues}
                                validator={validator}
                                addValuesButtonRef={addValuesButtonRef}
                                editingOpen={editingOpen}
                                setEditingOpen={setEditingOpen}
                            />
                        )}
                    </ValueList>
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
            {isCidrConstraint(localConstraint) ? <CidrSdkRequirements /> : null}
            <InlineEdit
                localConstraint={localConstraint}
                legalValueData={legalValueData}
                editingOpen={editingOpen}
                toggleValue={toggleValue}
                addValues={addValues}
                clearAll={clearAll}
                validator={validator}
            />
        </Container>
    );
};
