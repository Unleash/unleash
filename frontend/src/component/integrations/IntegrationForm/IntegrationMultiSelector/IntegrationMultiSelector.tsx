import type { HTMLAttributes, Key } from 'react';
import type { IAutocompleteBoxOption } from '../../../common/AutocompleteBox/AutocompleteBox.tsx';
import type {
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import { styled } from '@mui/system';
import {
    capitalize,
    Checkbox,
    Paper,
    TextField,
    Autocomplete,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { FormField } from 'component/common/FormField/FormField';
import { useUiFlag } from 'hooks/useUiFlag';
import { StyledHelpText, StyledTitle } from '../IntegrationForm.styles';

export interface IIntegrationMultiSelectorProps {
    options: IAutocompleteBoxOption[];
    selectedItems: string[];
    onChange: (value: string[]) => void;
    error?: string;
    onFocus?: () => void;
    entityName: string;
    description: string;
    note?: string;
    required?: boolean;
}

const StyledCheckbox = styled(Checkbox)(() => ({
    marginRight: '0.2em',
}));

const CustomPaper = ({ ...props }) => <Paper elevation={8} {...props} />;

export const IntegrationMultiSelector = ({
    options,
    selectedItems,
    onChange,
    error,
    onFocus,
    entityName,
    description,
    note,
    required,
}: IIntegrationMultiSelectorProps) => {
    const topLabelInputs = useUiFlag('topLabelInputs');

    const fieldLabel = (
        <>
            {capitalize(`${entityName}s`)}
            {required ? '*' : ''}
        </>
    );

    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            error={Boolean(error)}
            helperText={error || note}
            variant='outlined'
            label={topLabelInputs ? undefined : fieldLabel}
            placeholder={`Select ${entityName}s to filter by`}
            onFocus={onFocus}
            data-testid={`select-${entityName}-input`}
        />
    );

    const renderOption = (
        props: HTMLAttributes<HTMLLIElement> & { key?: Key },
        option: IAutocompleteBoxOption,
        { selected }: AutocompleteRenderOptionState,
    ) => {
        const { key, ...rest } = props;
        return (
            <li key={key} {...rest}>
                <StyledCheckbox
                    icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
                    checkedIcon={<CheckBoxIcon fontSize='small' />}
                    checked={selected}
                />
                {option.label}
            </li>
        );
    };

    const control = (
        <Autocomplete
            size='small'
            multiple
            limitTags={2}
            options={options}
            disableCloseOnSelect
            getOptionLabel={({ label }) => label}
            fullWidth
            renderOption={renderOption}
            renderInput={renderInput}
            value={options.filter((option) =>
                selectedItems.includes(option.value),
            )}
            onChange={(_, input) => {
                const state = input.map(({ value }) => value);
                onChange(state);
            }}
            slots={{
                paper: CustomPaper,
            }}
        />
    );

    if (!topLabelInputs) {
        return (
            <>
                <StyledTitle>{capitalize(`${entityName}s`)}</StyledTitle>
                <StyledHelpText>{description}</StyledHelpText>
                {control}
            </>
        );
    }

    return (
        <FormField label={fieldLabel} description={description}>
            {control}
        </FormField>
    );
};
