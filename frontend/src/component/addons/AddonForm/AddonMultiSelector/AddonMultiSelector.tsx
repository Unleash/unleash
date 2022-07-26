import React, { ChangeEvent, Fragment, useState, VFC } from 'react';
import { IAutocompleteBoxOption } from '../../../common/AutocompleteBox/AutocompleteBox';
import { styles as themeStyles } from 'component/common';
import {
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
} from '@mui/material/Autocomplete';
import { styled } from '@mui/system';
import { capitalize, Checkbox, Paper, TextField } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { SelectAllButton } from '../../../admin/apiToken/ApiTokenForm/SelectProjectInput/SelectAllButton/SelectAllButton';
import {
    StyledHelpText,
    StyledSelectAllFormControlLabel,
    StyledTitle,
    StyledAutocomplete,
} from '../AddonForm.styles';

export interface IAddonMultiSelectorProps {
    options: IAutocompleteBoxOption[];
    selectedItems: string[];
    onChange: (value: string[]) => void;
    error?: string;
    onFocus?: () => void;
    entityName: string;
    selectAllEnabled: boolean;
    description?: string;
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
    description,
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
        <StyledSelectAllFormControlLabel
            data-testid={`select-all-${entityName}s`}
            control={
                <Checkbox
                    checked={isWildcardSelected}
                    onChange={onAllItemsChange}
                />
            }
            label={`ALL current and future ${entityName}s`}
        />
    );

    const DefaultHelpText = () => (
        <StyledHelpText>
            Selecting {entityName}(s) here will filter events so that your addon
            will only receive events that are tagged with one of your{' '}
            {entityName}s.
        </StyledHelpText>
    );

    return (
        <React.Fragment>
            <StyledTitle>{capitalize(entityName)}s</StyledTitle>
            <ConditionallyRender
                condition={description !== undefined}
                show={<StyledHelpText>{description}</StyledHelpText>}
            />
            <ConditionallyRender
                condition={selectAllEnabled}
                show={<DefaultHelpText />}
            />
            <span className={themeStyles.error}>{error}</span>
            <ConditionallyRender
                condition={selectAllEnabled}
                show={<SelectAllFormControl />}
            />
            <StyledAutocomplete
                disabled={isWildcardSelected}
                multiple
                limitTags={2}
                options={options}
                disableCloseOnSelect
                //@ts-expect-error
                getOptionLabel={({ label }) => label}
                fullWidth
                groupBy={() => 'Select/Deselect all'}
                renderGroup={renderGroup}
                PaperComponent={CustomPaper}
                //@ts-expect-error
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
                    //@ts-expect-error
                    const state = input.map(({ value }) => value);
                    onChange(state);
                }}
            />
        </React.Fragment>
    );
};
