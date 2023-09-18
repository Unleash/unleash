import { VFC } from 'react';
import { IAutocompleteBoxOption } from '../../../common/AutocompleteBox/AutocompleteBox';
import {
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
    Typography,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { StyledTitle } from '../IntegrationForm.styles';

export interface IIntegrationMultiSelectorProps {
    options: IAutocompleteBoxOption[];
    selectedItems: string[];
    onChange: (value: string[]) => void;
    error?: string;
    onFocus?: () => void;
    entityName: string;
    description: React.ReactNode;
    required?: boolean;
}

const StyledCheckbox = styled(Checkbox)(() => ({
    marginRight: '0.2em',
}));

const CustomPaper = ({ ...props }) => <Paper elevation={8} {...props} />;

export const IntegrationMultiSelector: VFC<IIntegrationMultiSelectorProps> = ({
    options,
    selectedItems,
    onChange,
    error,
    onFocus,
    entityName,
    description,
    required,
}) => {
    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            error={Boolean(error)}
            helperText={error}
            variant="outlined"
            label={`${capitalize(entityName)}s`}
            placeholder={`Select ${entityName}s to filter by`}
            onFocus={onFocus}
            data-testid={`select-${entityName}-input`}
        />
    );

    const renderOption = (
        props: object,
        option: IAutocompleteBoxOption,
        { selected }: AutocompleteRenderOptionState
    ) => {
        return (
            <li {...props}>
                <StyledCheckbox
                    icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                    checkedIcon={<CheckBoxIcon fontSize="small" />}
                    checked={selected}
                />
                {option.label}
            </li>
        );
    };

    return (
        <>
            <StyledTitle>
                {capitalize(`${entityName}s`)}
                {required ? (
                    <Typography component="span" color="error">
                        *
                    </Typography>
                ) : null}
            </StyledTitle>
            {description}
            <Autocomplete
                sx={{
                    marginTop: 1.5,
                }}
                size="small"
                multiple
                limitTags={2}
                options={options}
                disableCloseOnSelect
                getOptionLabel={({ label }) => label}
                fullWidth
                PaperComponent={CustomPaper}
                renderOption={renderOption}
                renderInput={renderInput}
                value={options.filter(option =>
                    selectedItems.includes(option.value)
                )}
                onChange={(_, input) => {
                    const state = input.map(({ value }) => value);
                    onChange(state);
                }}
            />
        </>
    );
};
