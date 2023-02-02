import {
    Autocomplete,
    AutocompleteValue,
    Checkbox,
    createFilterOptions,
    FilterOptionsState,
    TextField,
} from '@mui/material';
import React, { useMemo } from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { ITag } from '../../../../../interfaces/tags';
import { ConditionallyRender } from '../../../../common/ConditionallyRender/ConditionallyRender';
import { Add } from '@mui/icons-material';
import useTags from '../../../../../hooks/api/getters/useTags/useTags';
import { AutocompleteChangeReason } from '@mui/base/AutocompleteUnstyled/useAutocomplete';
import useTagApi from '../../../../../hooks/api/actions/useTagApi/useTagApi';

export type TagOption = {
    title: string;
    inputValue?: string;
};
interface ITagsInputProps {
    tagType: string;
    featureTags: ITag[];
    onChange: (newTags: TagOption[]) => void;
}

const filter = createFilterOptions<TagOption>();

export const TagsInput = ({
    tagType,
    onChange,
    featureTags,
}: ITagsInputProps) => {
    const { createTag } = useTagApi();
    const { tags } = useTags(tagType);

    const options: TagOption[] = useMemo(() => {
        return tags.map(tag => {
            return {
                title: tag.value,
            };
        });
    }, [tags]);

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const handleChange = (
        event: React.SyntheticEvent,
        newValue: AutocompleteValue<TagOption, true, undefined, undefined>,
        reason: AutocompleteChangeReason
    ) => {
        console.log(`reason()`, reason);
        if (reason === 'selectOption') {
            newValue.forEach(value => {
                if (value.inputValue) {
                    createTag({
                        value: value.inputValue,
                        type: tagType,
                    }).then();
                }
            });
        }
        newValue && onChange(newValue);
    };

    const getOptionDisabled = (option: TagOption) => {
        return featureTags.some(
            tag => tag.type === tagType && tag.value === option.title
        );
    };

    const getOptionLabel = (option: string | TagOption) => {
        if (typeof option === 'string') {
            return option;
        }
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
        const exists = featureTags.some(
            tag => tag.type === tagType && tag.value === option.title
        );
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
                            checked={selected || exists}
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
            options={options}
            disableCloseOnSelect
            placeholder="Select Values"
            getOptionDisabled={getOptionDisabled}
            getOptionLabel={getOptionLabel}
            renderOption={renderOption}
            style={{ width: 500 }}
            onChange={handleChange}
            filterOptions={filterOptions}
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
