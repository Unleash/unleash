import React, { Fragment, useState, ChangeEvent, VFC } from 'react';
import {
    Checkbox,
    FormControlLabel,
    TextField,
    Box,
    Paper,
} from '@material-ui/core';
import {
    Autocomplete,
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@material-ui/lab';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { IAutocompleteBoxOption } from 'component/common/AutocompleteBox/AutocompleteBox';
import { useStyles } from '../ApiTokenForm.styles';
import { SelectAllButton } from './SelectAllButton/SelectAllButton';
import ConditionallyRender from 'component/common/ConditionallyRender';

const ALL_PROJECTS = '*';

// Fix for shadow under Autocomplete - match with Select input
const CustomPaper = ({ ...props }) => <Paper elevation={8} {...props} />;

export interface ISelectProjectInputProps {
    disabled?: boolean;
    options: IAutocompleteBoxOption[];
    defaultValue: string[];
    onChange: (value: string[]) => void;
    onFocus?: () => void;
    error?: string;
}

export const SelectProjectInput: VFC<ISelectProjectInputProps> = ({
    options,
    defaultValue = [ALL_PROJECTS],
    onChange,
    disabled,
    error,
    onFocus,
}) => {
    const styles = useStyles();
    const [projects, setProjects] = useState<string[]>(
        typeof defaultValue === 'string' ? [defaultValue] : defaultValue
    );
    const [isWildcardSelected, selectWildcard] = useState(
        typeof defaultValue === 'string' || defaultValue.includes(ALL_PROJECTS)
    );
    const isAllSelected =
        projects.length > 0 &&
        projects.length === options.length &&
        projects[0] !== ALL_PROJECTS;

    const onAllProjectsChange = (
        e: ChangeEvent<HTMLInputElement>,
        checked: boolean
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
        option: IAutocompleteBoxOption,
        { selected }: AutocompleteRenderOptionState
    ) => (
        <>
            <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                checked={selected}
                className={styles.selectOptionCheckbox}
            />
            {option.label}
        </>
    );

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
            error={!!error}
            helperText={error}
            variant="outlined"
            label="Projects"
            placeholder="Select one or more projects"
            onFocus={onFocus}
            data-testid="select-input"
        />
    );

    return (
        <Box sx={{ mt: -1, mb: 3 }}>
            <Box sx={{ mt: 1, mb: 0.25, ml: 1.5 }}>
                <FormControlLabel
                    disabled={disabled}
                    data-testid="select-all-projects"
                    control={
                        <Checkbox
                            checked={disabled || isWildcardSelected}
                            onChange={onAllProjectsChange}
                        />
                    }
                    label="ALL current and future projects"
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
                renderInput={renderInput}
                value={
                    isWildcardSelected || disabled
                        ? options
                        : options.filter(option =>
                              projects.includes(option.value)
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
