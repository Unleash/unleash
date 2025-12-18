import { IconButton, styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import { isStringOperator, type Operator } from 'constants/operators';
import { useCallback, useRef, type FC } from 'react';
import { operatorsForContext } from 'utils/operatorsForContext';
import { ConstraintOperatorSelect } from './ConstraintOperatorSelect.tsx';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import Delete from '@mui/icons-material/Delete';
import { ValueList } from './ValueList.tsx';
import { ReactComponent as CaseSensitiveIcon } from 'assets/icons/case-sensitive.svg';
import { ReactComponent as CaseInsensitiveIcon } from 'assets/icons/case-insensitive.svg';
import { AddValuesWidget } from './AddValuesWidget.tsx';

import { ReactComponent as EqualsIcon } from 'assets/icons/constraint-equals.svg';
import { ReactComponent as NotEqualsIcon } from 'assets/icons/constraint-not-equals.svg';
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
    isSemVerConstraint,
} from './useEditableConstraint/editable-constraint-type.ts';
import type { ConstraintValidationResult } from './useEditableConstraint/constraint-validator.ts';
import { useCombinedGlobalAndProjectContext } from 'hooks/api/getters/useUnleashContext/useCombinedGlobalAndProjectContext.ts';
import { useOptionalPathParam } from 'hooks/useOptionalPathParam.ts';

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
    path: {
        fill: 'currentColor',
    },
}));

const TopRowInput: FC<{
    addValues: (value: string | string[]) => void;
    clearValues: () => void;
    localConstraint: EditableConstraintType;
    validator: (value: string) => ConstraintValidationResult;
    addValuesButtonRef: React.RefObject<HTMLButtonElement>;
}> = ({
    addValues,
    clearValues,
    localConstraint,
    validator,
    addValuesButtonRef,
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

    const projectId = useOptionalPathParam('projectId');
    const { context } = useCombinedGlobalAndProjectContext(projectId);

    const { contextName, operator } = localConstraint;
    const showCaseSensitiveButton = isStringOperator(operator);
    const deleteButtonRef = useRef<HTMLButtonElement>(null);
    const addValuesButtonRef = useRef<HTMLButtonElement>(null);

    if (!context) {
        return null;
    }

    const extantContextFieldNames = context.map((context) => context.name);
    const contextFieldHasBeenDeleted = !extantContextFieldNames.includes(
        localConstraint.contextName,
    );

    const availableContextFieldNames = contextFieldHasBeenDeleted
        ? [...extantContextFieldNames, localConstraint.contextName].toSorted()
        : extantContextFieldNames;

    const contextFieldOptions = availableContextFieldNames.map((option) => ({
        key: option,
        label: option,
    }));

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
                            <HtmlTooltip
                                title={`Make the selected operator${localConstraint.inverted ? ' inclusive' : ' exclusive'}`}
                                arrow
                                describeChild
                            >
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
                                </StyledButton>
                            </HtmlTooltip>

                            <ConstraintOperatorSelect
                                options={operatorsForContext(contextName)}
                                value={operator}
                                onChange={onOperatorChange}
                                inverted={localConstraint.inverted}
                            />

                            {showCaseSensitiveButton ? (
                                <HtmlTooltip
                                    title={`Make match${localConstraint.caseInsensitive ? ' ' : ' not '}case sensitive`}
                                    arrow
                                    describeChild
                                >
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
                                    </StyledButton>
                                </HtmlTooltip>
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
