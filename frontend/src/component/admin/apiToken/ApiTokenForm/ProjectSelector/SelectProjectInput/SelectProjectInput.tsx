import { type FC, Fragment, useState, type ChangeEvent } from 'react';
import {
    Checkbox,
    FormControlLabel,
    TextField,
    Box,
    Paper,
    styled,
    Chip,
} from '@mui/material';
import { Autocomplete } from '@mui/material';

import type {
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import type { IAutocompleteBoxOption } from 'component/common/AutocompleteBox/AutocompleteBox';
import { SelectAllButton } from './SelectAllButton/SelectAllButton.tsx';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const ALL_PROJECTS = '*';

// Fix for shadow under Autocomplete - match with Select input
const CustomPaper = ({ ...props }) => <Paper elevation={8} {...props} />;

const SelectOptionCheckbox = styled(Checkbox)(({ theme }) => ({
    marginRight: theme.spacing(0.4),
}));

export interface ISelectProjectInputProps {
    disabled?: boolean;
    options: IAutocompleteBoxOption[];
    defaultValue: string[];
    onChange: (value: string[]) => void;
    onFocus?: () => void;
    error?: string;
}

export const SelectProjectInput: FC<ISelectProjectInputProps> = ({
    options,
    defaultValue = [ALL_PROJECTS],
    onChange,
    disabled,
    error,
    onFocus,
}) => {
    const [projects, setProjects] = useState<string[]>(
        typeof defaultValue === 'string' ? [defaultValue] : defaultValue,
    );
    const [isWildcardSelected, selectWildcard] = useState(
        typeof defaultValue === 'string' || defaultValue.includes(ALL_PROJECTS),
    );
    const isAllSelected =
        projects.length > 0 &&
        projects.length === options.length &&
        projects[0] !== ALL_PROJECTS;

    const onAllProjectsChange = (
        e: ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) => {
        if (checked) {
            selectWildcard(true);
            onChange([ALL_PROJECTS]);
        } else {
            selectWildcard(false);
            onChange(projects.includes(ALL_PROJECTS) ? [] : projects);
        }
    };

    const onSelectAllClick = () => {
        const newProjects = isAllSelected
            ? []
            : options.map(({ value }) => value);
        setProjects(newProjects);
        onChange(newProjects);
    };

    const renderOption = (
        props: object & { key?: string },
        option: IAutocompleteBoxOption,
        { selected }: AutocompleteRenderOptionState,
    ) => {
        const { key, ...rest } = props;
        return (
            <li key={key} {...rest}>
                <SelectOptionCheckbox
                    icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
                    checkedIcon={<CheckBoxIcon fontSize='small' />}
                    checked={selected}
                />
                {option.label}
            </li>
        );
    };

    const renderGroup = ({ key, children }: AutocompleteRenderGroupParams) => (
        <Fragment key={key}>
            <ConditionallyRender
                condition={options.length > 2}
                show={
                    <SelectAllButton
                        isAllSelected={isAllSelected}
                        onClick={onSelectAllClick}
                    />
                }
            />
            {children}
        </Fragment>
    );

    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            error={Boolean(error)}
            helperText={error}
            variant='outlined'
            label='Projects'
            placeholder='Select one or more projects'
            onFocus={onFocus}
            data-testid='select-input'
        />
    );

    return (
        <Box sx={{ mt: -1, mb: 3 }}>
            <Box sx={{ mt: 1, mb: 0.25, ml: 1.5 }}>
                <FormControlLabel
                    disabled={disabled}
                    data-testid='select-all-projects'
                    control={
                        <Checkbox
                            checked={disabled || isWildcardSelected}
                            onChange={onAllProjectsChange}
                        />
                    }
                    label='ALL current and future projects'
                />
            </Box>
            <Autocomplete
                disabled={disabled || isWildcardSelected}
                multiple
                limitTags={2}
                options={options}
                disableCloseOnSelect
                getOptionLabel={({ label }) => label}
                groupBy={() => 'Select/Deselect all'}
                renderGroup={renderGroup}
                fullWidth
                PaperComponent={CustomPaper}
                renderOption={renderOption}
                renderTags={(value, getTagProps) => {
                    return value.map((option, index) => {
                        const { key, ...props } = getTagProps({ index });
                        return (
                            <Chip
                                size='small'
                                key={key}
                                {...props}
                                label={option.label}
                            />
                        );
                    });
                }}
                renderInput={renderInput}
                value={
                    isWildcardSelected || disabled
                        ? options
                        : options.filter((option) =>
                              projects.includes(option.value),
                          )
                }
                onChange={(_, input) => {
                    const state = input.map(({ value }) => value);
                    setProjects(state);
                    onChange(state);
                }}
            />
        </Box>
    );
};
