import {
    Alert,
    autocompleteClasses,
    Button,
    type InputBaseComponentProps,
    styled,
    useTheme,
} from '@mui/material';
import {
    type FC,
    type KeyboardEvent,
    type ReactNode,
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
import type { LegalValueData } from './useEditableConstraint/useEditableConstraint.tsx';
import { InlineValueChrome } from './InlineValueChrome.tsx';

export type SubmitValue = (
    value: string,
    setError: (error: string) => void,
    setAnnouncement: (message: string) => void,
    checkValues?: (newValues: string[]) => string | undefined,
) => boolean;

export type InlineValueProps = {
    value: string;
    onChange: (value: string) => void;
    onClose: (shouldManageFocus: boolean) => void;
    submitValue: SubmitValue;
    helpText?: ReactNode;
    htmlInputProps?: InputBaseComponentProps;
    ValuePreview?: FC<{ value: string }>;
    multiValue?: boolean;
    selectedValues: Set<string>;
    toggleValue: (value: string) => void;
    legalValues?: LegalValueData;
};

const SelfHighlightingOptions = styled('div')(({ theme }) => ({
    [`.${autocompleteClasses.focused}`]: {
        backgroundColor: theme.palette.action.hover,
    },
    [`.${autocompleteClasses.focusVisible}`]: {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: '-2px',
    },
}));

export const PlainValueInput: FC<InlineValueProps> = ({
    value,
    onChange,
    onClose,
    submitValue,
    helpText,
    htmlInputProps,
    ValuePreview,
    multiValue,
}) => {
    const [error, setError] = useState('');
    const [announcement, setAnnouncement] = useState('');
    const inputId = useId();

    const submit = () => submitValue(value, setError, setAnnouncement);

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // MUI bubbles the "Add" adornment's keys to the field too — ignore
        // those, or they'd cancel the button's own click (see addViaInput).
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
            inputId={inputId}
            value={value}
            error={error}
            announcement={announcement}
            helpText={helpText}
            ValuePreview={ValuePreview}
            multiValue={multiValue}
            onChange={(e) => {
                onChange(e.target.value);
                setError('');
            }}
            onKeyDown={onKeyDown}
            onClose={onClose}
            submit={multiValue ? undefined : submit}
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
    submitValue,
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

    const checkIsLegal = (newValues: string[]): string | undefined => {
        const legalValueSet = new Set(
            legalValues.legalValues.map((legal) => legal.value),
        );
        const notLegal = newValues.find((v) => !legalValueSet.has(v));
        return notLegal
            ? `"${notLegal}" is not a legal value for this field.`
            : undefined;
    };

    const submit = () =>
        submitValue(value, setError, setAnnouncement, checkIsLegal);

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
        // those, or they'd cancel the button's own click (see addViaInput).
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

    return (
        <InlineValueChrome
            inputId={inputId}
            value={value}
            error={error}
            announcement={announcement}
            helpText={helpText}
            ValuePreview={ValuePreview}
            multiValue={multiValue}
            rootProps={rootProps}
            inputRef={inputRef}
            onChange={(e) => listboxOnChange?.(e)}
            onBlur={listboxOnBlur}
            onKeyDown={onKeyDown}
            onClose={onClose}
            htmlInputProps={listboxInputProps}
            footerActions={
                multiValue ? (
                    <Button
                        size='small'
                        onClick={toggleSelectAll}
                        sx={{ whiteSpace: 'nowrap' }}
                        data-testid='CONSTRAINT_VALUES_SELECT_ALL'
                    >
                        {isAllSelected ? 'Unselect all' : 'Select all'}
                    </Button>
                ) : undefined
            }
        >
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
                    This constraint is currently using values that were valid in
                    the past but have since been deleted. If you save changes on
                    this constraint the following values will be removed:
                    <ul>
                        {[...deletedLegalValues].map((deletedValue) => (
                            <li key={deletedValue}>{deletedValue}</li>
                        ))}
                    </ul>
                </Alert>
            ) : null}
        </InlineValueChrome>
    );
};
