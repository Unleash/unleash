import {
    Autocomplete,
    type AutocompleteProps,
    Checkbox,
    createFilterOptions,
    type FilterOptionsState,
    TextField,
} from '@mui/material';
import type React from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import type { ITagType } from 'interfaces/tags';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import Add from '@mui/icons-material/Add';
import type { TagSchema } from 'openapi';

export type TagOption = {
    title: string;
    inputValue?: string;
};

interface ITagsInputProps {
    options: TagOption[];
    existingTags: TagSchema[];
    tagType: ITagType;
    selectedOptions: TagOption[];
    indeterminateOptions?: TagOption[];
    disabled?: boolean;
    onChange: AutocompleteProps<TagOption, true, false, false>['onChange'];
}

const filter = createFilterOptions<TagOption>();

export const TagsInput = ({
    options,
    selectedOptions,
    indeterminateOptions,
    tagType,
    existingTags,
    disabled = false,
    onChange,
}: ITagsInputProps) => {
    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;

    const getOptionLabel = (option: TagOption) => {
        // Add "xxx" option created dynamically
        if (option.inputValue) {
            return option.inputValue;
        }
        // Regular option
        return option.title;
    };

    const renderOption = (
        {
            key,
            ...props
        }: JSX.IntrinsicAttributes &
            React.ClassAttributes<HTMLLIElement> &
            React.LiHTMLAttributes<HTMLLIElement>,
        option: TagOption,
        { selected }: { selected: boolean },
    ) => {
        const isIndeterminate =
            indeterminateOptions?.some(
                (indeterminateOption) =>
                    indeterminateOption.title === option.title,
            ) ?? false;
        return (
            <li key={key} {...props}>
                <ConditionallyRender
                    condition={Boolean(option.inputValue)}
                    show={<Add sx={{ mr: (theme) => theme.spacing(0.5) }} />}
                    elseShow={
                        <Checkbox
                            icon={icon}
                            checkedIcon={<CheckBoxIcon fontSize='small' />}
                            indeterminateIcon={
                                <IndeterminateCheckBoxIcon fontSize='small' />
                            }
                            sx={{ mr: (theme) => theme.spacing(0.5) }}
                            checked={selected && !isIndeterminate}
                            indeterminate={isIndeterminate}
                        />
                    }
                />
                {option.title}
            </li>
        );
    };

    const filterOptions = (
        options: TagOption[],
        params: FilterOptionsState<TagOption>,
    ) => {
        const inputValue = params.inputValue.trim();

        const filtered = filter(options, {
            ...params,
            inputValue,
        });

        // Suggest the creation of a new value
        const isExisting = options.some(
            (option) => inputValue === option.title,
        );

        if (inputValue.length >= 2 && !isExisting) {
            filtered.push({
                inputValue,
                title: `Create new value "${inputValue}"`,
            });
        }

        return filtered;
    };

    return (
        <Autocomplete
            multiple
            id='checkboxes-tag'
            sx={{ marginTop: (theme) => theme.spacing(2), width: 500 }}
            disableCloseOnSelect
            options={options}
            value={selectedOptions}
            isOptionEqualToValue={(option, value) => {
                if (value.inputValue && value.inputValue !== '') {
                    return option.title === value.inputValue;
                } else {
                    return option.title === value.title;
                }
            }}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            filterOptions={filterOptions}
            ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
            onChange={onChange}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Select values'
                    placeholder='Select values'
                />
            )}
            disabled={disabled}
        />
    );
};
