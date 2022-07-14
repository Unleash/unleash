import React, { ChangeEvent, Fragment, useState, VFC } from 'react';
import { IAutocompleteBoxOption } from '../../../common/AutocompleteBox/AutocompleteBox';
import { styles as themeStyles } from 'component/common';
import {
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import { styled } from '@mui/system';
import {
    Autocomplete,
    Box,
    capitalize,
    Checkbox,
    FormControlLabel,
    Paper,
    TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { SelectAllButton } from '../../../admin/apiToken/ApiTokenForm/SelectProjectInput/SelectAllButton/SelectAllButton';

export interface IAddonMultiSelectorProps {
    options: IAutocompleteBoxOption[];
    selectedItems: string[];
    onChange: (value: string[]) => void;
    error?: string;
    onFocus?: () => void;
    entityName: string;
    selectAllEnabled: boolean;
}

const ALL_OPTIONS = '*';

const StyledCheckbox = styled(Checkbox)(() => ({
    marginRight: '0.2em',
}));

const CustomPaper = ({ ...props }) => <Paper elevation={8} {...props} />;

export const AddonMultiSelector: VFC<IAddonMultiSelectorProps> = ({
    options,
    selectedItems,
    onChange,
    error,
    onFocus,
    entityName,
    selectAllEnabled = true,
}) => {
    const [isWildcardSelected, selectWildcard] = useState(
        selectedItems.includes(ALL_OPTIONS)
    );
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

    const isAllSelected =
        selectedItems.length > 0 &&
        selectedItems.length === options.length &&
        selectedItems[0] !== ALL_OPTIONS;

    const onAllItemsChange = (
        e: ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => {
        if (checked) {
            selectWildcard(true);
            onChange([ALL_OPTIONS]);
        } else {
            selectWildcard(false);
            onChange(selectedItems.includes(ALL_OPTIONS) ? [] : selectedItems);
        }
    };

    const onSelectAllClick = () => {
        const newItems = isAllSelected ? [] : options.map(({ value }) => value);
        onChange(newItems);
    };
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
    const renderGroup = ({ key, children }: AutocompleteRenderGroupParams) => (
        <Fragment key={key}>
            <ConditionallyRender
                condition={options.length > 2 && selectAllEnabled}
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
    const SelectAllFormControl = () => (
        <Box sx={{ mt: 1, mb: 0.25, ml: 1.5 }}>
            <FormControlLabel
                data-testid={`select-all-${entityName}s`}
                control={
                    <Checkbox
                        checked={isWildcardSelected}
                        onChange={onAllItemsChange}
                    />
                }
                label={`ALL current and future ${entityName}s`}
            />
        </Box>
    );

    const HelpText = () => (
        <p>
            Selecting {entityName}(s) here will filter events so that your addon
            will only receive events that are tagged with one of your{' '}
            {entityName}s.
        </p>
    );

    return (
        <React.Fragment>
            <h4>{capitalize(entityName)}s</h4>
            <ConditionallyRender
                condition={selectAllEnabled}
                show={<HelpText />}
            />
            <span className={themeStyles.error}>{error}</span>
            <br />
            <Box sx={{ mt: -1, mb: 3 }}>
                <ConditionallyRender
                    condition={selectAllEnabled}
                    show={<SelectAllFormControl />}
                />
                <Autocomplete
                    disabled={isWildcardSelected}
                    multiple
                    limitTags={2}
                    options={options}
                    disableCloseOnSelect
                    getOptionLabel={({ label }) => label}
                    fullWidth
                    groupBy={() => 'Select/Deselect all'}
                    renderGroup={renderGroup}
                    PaperComponent={CustomPaper}
                    renderOption={renderOption}
                    renderInput={renderInput}
                    value={
                        isWildcardSelected
                            ? options
                            : options.filter(option =>
                                  selectedItems.includes(option.value)
                              )
                    }
                    onChange={(_, input) => {
                        const state = input.map(({ value }) => value);
                        onChange(state);
                    }}
                />
            </Box>
        </React.Fragment>
    );
};
