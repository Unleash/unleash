import {
    Autocomplete,
    AutocompleteProps,
    Checkbox,
    createFilterOptions,
    FilterOptionsState,
    TextField,
} from '@mui/material';
import React from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ITag } from 'interfaces/tags';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Add } from '@mui/icons-material';

export type TagOption = {
    title: string;
    inputValue?: string;
};
interface ITagsInputProps {
    options: TagOption[];
    selectedOptions: TagOption[];
    onChange: AutocompleteProps<TagOption | string, true, any, any>['onChange'];
}

const filter = createFilterOptions<TagOption>();

export const TagsInput = ({
    options,
    selectedOptions,
    onChange,
}: ITagsInputProps) => {
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const getOptionLabel = (option: TagOption) => {
        // Add "xxx" option created dynamically
        if (option.inputValue) {
            return option.inputValue;
        }
        // Regular option
        return option.title;
    };

    const renderOption = (
        props: JSX.IntrinsicAttributes &
            React.ClassAttributes<HTMLLIElement> &
            React.LiHTMLAttributes<HTMLLIElement>,
        option: TagOption,
        { selected }: { selected: boolean }
    ) => {
        return (
            <li {...props}>
                <ConditionallyRender
                    condition={Boolean(option.inputValue)}
                    show={<Add sx={{ mr: theme => theme.spacing(0.5) }} />}
                    elseShow={
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            sx={{ mr: theme => theme.spacing(0.5) }}
                            checked={selected}
                        />
                    }
                />
                {option.title}
            </li>
        );
    };

    const filterOptions = (
        options: TagOption[],
        params: FilterOptionsState<TagOption>
    ) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some(option => inputValue === option.title);
        if (inputValue !== '' && !isExisting) {
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
            id="checkboxes-tags-demo"
            sx={{ marginTop: theme => theme.spacing(2), width: 500 }}
            disableCloseOnSelect
            placeholder="Select Values"
            options={options}
            defaultValue={selectedOptions}
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
            renderInput={params => (
                <TextField
                    {...params}
                    label="Select values"
                    placeholder="Select values"
                />
            )}
        />
    );
};
