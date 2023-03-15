import {
    Autocomplete,
    AutocompleteProps,
    Checkbox,
    Chip,
    createFilterOptions,
    FilterOptionsState,
    TextField,
} from '@mui/material';
import React from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ITag, ITagType } from 'interfaces/tags';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Add } from '@mui/icons-material';
import { AutocompleteRenderGetTagProps } from '@mui/material/Autocomplete/Autocomplete';

export type TagOption = {
    title: string;
    inputValue?: string;
};
interface ITagsInputProps {
    options: TagOption[];
    existingTags: ITag[];
    tagType: ITagType;
    selectedOptions: TagOption[];
    onChange: AutocompleteProps<TagOption | string, true, any, any>['onChange'];
}

const filter = createFilterOptions<TagOption>();

export const TagsInput = ({
    options,
    selectedOptions,
    tagType,
    existingTags,
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

    const renderTags = (
        tagValue: TagOption[],
        getTagProps: AutocompleteRenderGetTagProps
    ) => {
        return tagValue.map((option, index) => {
            const exists = existingTags.some(
                existingTag =>
                    existingTag.value === option.title &&
                    existingTag.type === tagType.name
            );
            if (exists) {
                return null;
            }
            return <Chip {...getTagProps({ index })} label={option.title} />;
        });
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
            id="checkboxes-tag"
            sx={{ marginTop: theme => theme.spacing(2), width: 500 }}
            disableCloseOnSelect
            placeholder="Select Values"
            options={options}
            value={selectedOptions}
            renderTags={renderTags}
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
