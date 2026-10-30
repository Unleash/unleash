import {
    alpha,
    Alert,
    autocompleteClasses,
    Button,
    ButtonBase,
    InputAdornment,
    Popper,
    type InputBaseComponentProps,
    styled,
    TextField,
    type Theme,
    useTheme,
} from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';
import {
    type ChangeEvent,
    type FC,
    type FocusEvent,
    type FocusEventHandler,
    type KeyboardEvent,
    type ReactNode,
    type Ref,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import { SelectOptionsList } from 'component/common/SelectPopover/SelectOptionsList.tsx';
import {
    type SelectOption,
    type SelectionProps,
    useSelectListbox,
} from 'component/common/SelectPopover/useSelectListbox.ts';
import type { ConstraintValidatorOutput } from './ConstraintValidatorOutput.ts';
import type { LegalValueData } from './useEditableConstraint/useEditableConstraint.tsx';

export type InlineValueProps = {
    value: string;
    onChange: (value: string) => void;
    parseInput: (raw: string) => string[];
    validator: (...values: string[]) => ConstraintValidatorOutput;
    onAddValues: (newValues: string[]) => void;
    onClose: (shouldManageFocus: boolean) => void;
    helpText?: string;
    htmlInputProps?: InputBaseComponentProps;
    ValuePreview?: FC<{ value: string }>;
    multiValue?: boolean;
    selectedValues: Set<string>;
    toggleValue: (value: string) => void;
    legalValues?: LegalValueData;
};

const submitDraftValue = ({
    value,
    parseInput,
    validator,
    legalValues,
    onAddValues,
    onChange,
    setError,
    setAnnouncement,
}: {
    value: string;
    parseInput: (raw: string) => string[];
    validator: (...values: string[]) => ConstraintValidatorOutput;
    legalValues?: LegalValueData;
    onAddValues: (newValues: string[]) => void;
    onChange: (value: string) => void;
    setError: (error: string) => void;
    setAnnouncement: (message: string) => void;
}) => {
    if (!value?.trim()) {
        setError('Value cannot be empty or whitespace');
        return;
    }

    const newValues = parseInput(value);

    if (newValues.length === 0) {
        setError('Values cannot be empty');
        return;
    }

    if (newValues.some((v) => v.length > 100)) {
        setError('Values cannot be longer than 100 characters');
        return;
    }

    if (legalValues) {
        const legalValueSet = new Set(
            legalValues.legalValues.map((legal) => legal.value),
        );
        const notLegal = newValues.find((v) => !legalValueSet.has(v));
        if (notLegal) {
            setError(`"${notLegal}" is not a legal value for this field.`);
            return;
        }
    }

    const [isValid, errorMessage] = validator(...newValues);
    if (!isValid) {
        setError(errorMessage);
        return;
    }

    onAddValues(newValues);
    onChange('');
    setAnnouncement(`"${value}" added`);
    setError('');
};

const Container = styled('div')({
    display: 'flex',
});

const InputArea = styled('div')({
    display: 'contents',
});

const inputSx = (theme: Theme) => ({
    width: 150,
    '& fieldset': {
        borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
        borderWidth: '1.5px',
        borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
});

const AddAdornmentButton = styled(ButtonBase)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadiusSmall,
    '&.Mui-disabled': {
        color: theme.palette.text.disabled,
    },
}));

const StyledPopper = styled(Popper)(({ theme }) => ({
    zIndex: theme.zIndex.modal,
}));

const FloatingPanel = styled('div')(({ theme }) => ({
    margin: theme.spacing(1, 0),
    width: theme.spacing(42),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[8],
}));

const PopoverBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
}));

const SelfHighlightingOptions = styled('div')(({ theme }) => ({
    [`.${autocompleteClasses.focused}`]: {
        backgroundColor: theme.palette.action.hover,
    },
    [`.${autocompleteClasses.focusVisible}`]: {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px',
    },
}));

const HelpText = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const ErrorText = styled('p')(({ theme }) => ({
    margin: 0,
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
}));

const Footer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const AddValueButton: FC<{ value: string; onClick: () => void }> = ({
    value,
    onClick,
}) => (
    <InputAdornment position='end'>
        <AddAdornmentButton
            disabled={!value?.trim()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            data-testid='CONSTRAINT_VALUES_ADD_BUTTON'
        >
            Add
        </AddAdornmentButton>
    </InputAdornment>
);

const ValueDescriptionBody: FC<{
    error: string;
    helpText?: string;
    ValuePreview?: FC<{ value: string }>;
    value: string;
    descriptionId: string;
}> = ({ error, helpText, ValuePreview, value, descriptionId }) => {
    if (!(error || helpText || ValuePreview)) return null;
    return (
        <PopoverBody id={descriptionId}>
            {error ? <ErrorText role='alert'>{error}</ErrorText> : null}
            {helpText && !error ? <HelpText>{helpText}</HelpText> : null}
            {ValuePreview ? <ValuePreview value={value} /> : null}
        </PopoverBody>
    );
};

type FieldProps = {
    inputId: string;
    error: string;
    setError: (error: string) => void;
    announcement: string;
    rootProps?: Record<string, unknown>;
    inputRef?: Ref<HTMLInputElement>;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    htmlInputProps?: InputBaseComponentProps;
    optionsPanel?: ReactNode;
    footerAction?: ReactNode;
};

type LockablePlacement = 'bottom-start' | 'top-start';

const useLockedFlipPlacement = (initialPlacement: LockablePlacement) => {
    const [placement, setPlacement] = useState(initialPlacement);
    const [flipEnabled, setFlipEnabled] = useState(true);

    const popperOptions = useMemo(
        () => ({
            strategy: 'fixed' as const,
            onFirstUpdate: (state: { placement?: string }) => {
                if (
                    state.placement === 'top-start' ||
                    state.placement === 'bottom-start'
                ) {
                    setPlacement(state.placement);
                }
                setFlipEnabled(false);
            },
        }),
        [],
    );

    const modifiers = useMemo(
        () => [
            {
                name: 'flip',
                enabled: flipEnabled,
                options: { boundary: document.body },
            },
            { name: 'preventOverflow', options: { boundary: document.body } },
        ],
        [flipEnabled],
    );

    return { placement, popperOptions, modifiers };
};

const InlineValueChrome: FC<
    Pick<
        InlineValueProps,
        'value' | 'onClose' | 'helpText' | 'ValuePreview' | 'multiValue'
    > &
        FieldProps
> = ({
    value,
    onClose,
    helpText,
    ValuePreview,
    multiValue,
    inputId,
    error,
    setError,
    announcement,
    rootProps,
    inputRef,
    onChange,
    onBlur,
    onKeyDown,
    htmlInputProps,
    optionsPanel,
    footerAction,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const { placement, popperOptions, modifiers } =
        useLockedFlipPlacement('bottom-start');
    const descriptionId = useId();
    const footerId = useId();
    const hasAutoSelected = useRef(false);

    const onContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!anchorEl?.contains(e.relatedTarget as Node | null)) {
            onClose(false);
        }
    };

    const submitAndRefocus = () => {
        const input = anchorEl?.querySelector('input');
        // Replay as if it came from the input, so toggling a highlighted
        // match and submitting typed/CSV text work the same as Enter does.
        input?.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
                cancelable: true,
            }),
        );
        input?.focus();
    };

    const hasDescription = Boolean(error || helpText || ValuePreview);

    return (
        <Container ref={setAnchorEl} onBlur={onContainerBlur}>
            <ScreenReaderOnly>
                <label htmlFor={inputId}>Constraint Value</label>
            </ScreenReaderOnly>
            <ScreenReaderOnly aria-live='polite'>
                {announcement}
            </ScreenReaderOnly>
            <InputArea {...rootProps}>
                <TextField
                    id={inputId}
                    placeholder='Enter value'
                    value={value}
                    inputRef={inputRef}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        onChange(e);
                        setError('');
                    }}
                    onBlur={onBlur}
                    onFocus={(e) => {
                        if (!hasAutoSelected.current) {
                            hasAutoSelected.current = true;
                            e.target.select();
                        }
                    }}
                    onKeyDown={onKeyDown}
                    size='medium'
                    variant='outlined'
                    autoFocus
                    error={Boolean(error)}
                    slotProps={{
                        htmlInput: {
                            ...htmlInputProps,
                            'aria-describedby': hasDescription
                                ? `${descriptionId} ${footerId}`
                                : footerId,
                        },
                        input: {
                            sx: inputSx,
                            endAdornment: (
                                <AddValueButton
                                    value={value}
                                    onClick={submitAndRefocus}
                                />
                            ),
                        },
                    }}
                    data-testid='CONSTRAINT_VALUES_INPUT'
                />
            </InputArea>
            <StyledPopper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                placement={placement}
                disablePortal
                popperOptions={popperOptions}
                modifiers={modifiers}
            >
                <FloatingPanel>
                    <ValueDescriptionBody
                        error={error}
                        helpText={helpText}
                        ValuePreview={ValuePreview}
                        value={value}
                        descriptionId={descriptionId}
                    />
                    {optionsPanel}
                    <Footer id={footerId}>
                        <span>
                            Enter to add
                            {multiValue ? ' · comma for many' : ''}
                        </span>
                        {footerAction}
                    </Footer>
                </FloatingPanel>
            </StyledPopper>
        </Container>
    );
};

export const PlainValueInput: FC<InlineValueProps> = ({
    value,
    onChange,
    onClose,
    parseInput,
    validator,
    onAddValues,
    helpText,
    htmlInputProps,
    ValuePreview,
    multiValue,
}) => {
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const inputId = useId();

    const submit = () =>
        submitDraftValue({
            value,
            parseInput,
            validator,
            onAddValues,
            onChange,
            setError,
            setAnnouncement,
        });

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // MUI bubbles the "Add" adornment's keys to the field too — ignore
        // those, or they'd cancel the button's own click (see submitAndRefocus).
        if ((e.target as HTMLElement).tagName !== 'INPUT') return;
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        } else if (e.key === 'Escape') {
            e.stopPropagation(); // don't also close an outer dialog
            onClose(true);
        }
    };

    return (
        <InlineValueChrome
            value={value}
            onClose={onClose}
            helpText={helpText}
            ValuePreview={ValuePreview}
            multiValue={multiValue}
            inputId={inputId}
            error={error}
            setError={setError}
            announcement={announcement}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            htmlInputProps={htmlInputProps}
        />
    );
};

export const LegalValuesInput: FC<
    InlineValueProps & { legalValues: LegalValueData }
> = ({
    value,
    onChange,
    onClose,
    parseInput,
    validator,
    onAddValues,
    helpText,
    ValuePreview,
    multiValue,
    selectedValues,
    toggleValue,
    legalValues,
}) => {
    const theme = useTheme();
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const inputId = useId();

    const submit = () =>
        submitDraftValue({
            value,
            parseInput,
            validator,
            legalValues,
            onAddValues,
            onChange,
            setError,
            setAnnouncement,
        });

    const {
        legalValues: legalValueList,
        invalidLegalValues,
        deletedLegalValues,
    } = legalValues;

    const options: SelectOption<string>[] = useMemo(
        () =>
            legalValueList.map((legal) => ({
                value: legal.value,
                label: legal.value,
                detail: legal.description,
                disabled: invalidLegalValues?.has(legal.value),
            })),
        [legalValueList, invalidLegalValues],
    );

    const selectionProps: SelectionProps<string> = multiValue
        ? {
              multiple: true,
              selected: Array.from(selectedValues),
              onChange: (newValues: string[]) => {
                  const nextSet = new Set(newValues);
                  const added = newValues.filter((v) => !selectedValues.has(v));
                  const removed = [...selectedValues].filter(
                      (v) => !nextSet.has(v),
                  );
                  [...added, ...removed].forEach(toggleValue);
                  onChange('');
              },
          }
        : {
              multiple: false,
              selected: [...selectedValues][0],
              onChange: (newValue: string) => {
                  toggleValue(newValue);
                  onChange('');
              },
          };

    const {
        getRootProps,
        inputRef,
        inputProps,
        getListboxProps,
        getOptionProps,
        isOptionSelected,
        groupedOptions,
        isAllSelected,
        toggleSelectAll,
        handleInputKeyDown,
    } = useSelectListbox({
        ...selectionProps,
        options,
        inputValue: value,
        onInputValueChange: onChange,
        onClose: () => onClose(true),
        id: inputId,
        matchesSearch: (option, searchText) =>
            option.label.toLowerCase().includes(searchText) ||
            (option.detail?.toLowerCase().includes(searchText) ?? false),
    });

    const {
        onChange: listboxOnChange,
        onBlur: listboxOnBlur,
        value: _listboxValue,
        ...listboxInputProps
    } = inputProps;

    const { onKeyDown: builtInKeyDown, ...rootProps } = getRootProps();

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // MUI bubbles the "Add" adornment's keys to the field too — ignore
        // those, or they'd cancel the button's own click (see submitAndRefocus).
        if ((e.target as HTMLElement).tagName !== 'INPUT') return;

        if (e.key === 'Escape') {
            e.stopPropagation(); // don't also close an outer dialog
            onClose(true);
            return;
        }

        // Toggles e.g. "stage-eu" if highlighted via arrow keys + Space.
        handleInputKeyDown(e);
        if (e.defaultPrevented) return;
        // Toggles e.g. "stage-eu" if auto-highlighted by typing "stage-e".
        builtInKeyDown?.(e);
        if (e.defaultPrevented) return; // it toggled — don't also submit
        if (e.key === 'Enter') {
            e.preventDefault();
            submit(); // nothing matched — submit the typed text itself
        }
    };

    const selectAllAction = multiValue ? (
        <Button
            size='small'
            onClick={toggleSelectAll}
            sx={{ whiteSpace: 'nowrap' }}
            data-testid='CONSTRAINT_VALUES_SELECT_ALL'
        >
            {isAllSelected ? 'Unselect all' : 'Select all'}
        </Button>
    ) : undefined;

    return (
        <InlineValueChrome
            value={value}
            onClose={onClose}
            helpText={helpText}
            ValuePreview={ValuePreview}
            multiValue={multiValue}
            inputId={inputId}
            error={error}
            setError={setError}
            announcement={announcement}
            rootProps={rootProps}
            inputRef={inputRef}
            onChange={(e) => listboxOnChange?.(e)}
            onBlur={listboxOnBlur}
            onKeyDown={onKeyDown}
            htmlInputProps={listboxInputProps}
            footerAction={selectAllAction}
            optionsPanel={
                <>
                    <SelfHighlightingOptions>
                        <SelectOptionsList
                            groupedOptions={groupedOptions}
                            listboxProps={getListboxProps()}
                            getOptionProps={getOptionProps}
                            isOptionSelected={isOptionSelected}
                            multiple={Boolean(multiValue)}
                            listMaxHeight={theme.spacing(40)}
                        />
                    </SelfHighlightingOptions>
                    {deletedLegalValues?.size ? (
                        <Alert severity='warning' sx={{ m: 2 }}>
                            This constraint is currently using values that were
                            valid in the past but have since been deleted. If
                            you save changes on this constraint the following
                            values will be removed:
                            <ul>
                                {[...deletedLegalValues].map((deletedValue) => (
                                    <li key={deletedValue}>{deletedValue}</li>
                                ))}
                            </ul>
                        </Alert>
                    ) : null}
                </>
            }
        />
    );
};
