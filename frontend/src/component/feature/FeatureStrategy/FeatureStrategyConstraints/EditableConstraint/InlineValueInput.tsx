import {
    alpha,
    Alert,
    autocompleteClasses,
    ButtonBase,
    InputAdornment,
    Popover,
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
    onClose: () => void;
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

const StyledPopover = styled(Popover)(({ theme }) => ({
    '& > .MuiPaper-root': {
        borderRadius: `${theme.shape.borderRadiusLarge}px`,
        border: `1px solid ${theme.palette.divider}`,
        width: theme.spacing(40),
        marginTop: theme.spacing(1),
    },
    '&.MuiPopover-root': {
        pointerEvents: 'none',
    },
    '& > .MuiPopover-paper': {
        pointerEvents: 'all',
    },
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
    padding: theme.spacing(1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

const ValuePopover: FC<{
    anchorEl: HTMLDivElement | null;
    children: ReactNode;
}> = ({ anchorEl, children }) => (
    <StyledPopover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        hideBackdrop
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
        {children}
    </StyledPopover>
);

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
    submit: () => void;
    rootProps?: Record<string, unknown>;
    inputRef?: Ref<HTMLInputElement>;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: FocusEventHandler<HTMLInputElement>;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    htmlInputProps?: InputBaseComponentProps;
    optionsPanel?: ReactNode;
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
    submit,
    rootProps,
    inputRef,
    onChange,
    onBlur,
    onKeyDown,
    htmlInputProps,
    optionsPanel,
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const descriptionId = useId();
    const footerId = useId();

    const onContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!anchorEl?.contains(e.relatedTarget as Node | null)) {
            onClose();
        }
    };

    const hasDescription = Boolean(error || helpText || ValuePreview);

    return (
        <Container ref={setAnchorEl} {...rootProps} onBlur={onContainerBlur}>
            <ScreenReaderOnly>
                <label htmlFor={inputId}>Constraint Value</label>
            </ScreenReaderOnly>
            <ScreenReaderOnly aria-live='polite'>
                {announcement}
            </ScreenReaderOnly>
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
                            <AddValueButton value={value} onClick={submit} />
                        ),
                    },
                }}
                data-testid='CONSTRAINT_VALUES_INPUT'
            />
            <ValuePopover anchorEl={anchorEl}>
                <ValueDescriptionBody
                    error={error}
                    helpText={helpText}
                    ValuePreview={ValuePreview}
                    value={value}
                    descriptionId={descriptionId}
                />
                {optionsPanel}
                <Footer id={footerId}>
                    Enter to add
                    {multiValue ? ' · comma for many' : ''}
                </Footer>
            </ValuePopover>
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
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        } else if (e.key === 'Escape') {
            onClose();
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
            submit={submit}
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
                  // Exactly one value changes per toggle; diff against
                  // selectedValues to find it instead of scanning legalValueList.
                  const nextSet = new Set(newValues);
                  const added = newValues.find((v) => !selectedValues.has(v));
                  const removed =
                      added === undefined
                          ? [...selectedValues].find((v) => !nextSet.has(v))
                          : undefined;
                  const changed = added ?? removed;
                  if (changed !== undefined) toggleValue(changed);
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
        handleInputKeyDown,
    } = useSelectListbox({
        ...selectionProps,
        options,
        inputValue: value,
        onInputValueChange: onChange,
        onClose,
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

    // Order matters: the built-in handler can select an auto-highlighted
    // option on Enter, with no signal we can check beforehand — so it must
    // run first; Enter/Escape only submit typed text if it didn't act.
    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        handleInputKeyDown(e);
        if (e.defaultPrevented) return;
        builtInKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        } else if (e.key === 'Escape') {
            onClose();
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
            submit={submit}
            rootProps={rootProps}
            inputRef={inputRef}
            onChange={(e) => listboxOnChange?.(e)}
            onBlur={listboxOnBlur}
            onKeyDown={onKeyDown}
            htmlInputProps={listboxInputProps}
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
