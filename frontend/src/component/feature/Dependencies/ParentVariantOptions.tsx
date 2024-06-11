import { Autocomplete, Checkbox, styled, TextField } from '@mui/material';
import type { FC } from 'react';
import { useParentVariantOptions } from 'hooks/api/getters/useFeatureDependencyOptions/useFeatureDependencyOptions';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const StyledAutocomplete = styled(Autocomplete<string, true>)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

export const ParentVariantOptions: FC<{
    project: string;
    parent: string;
    selectedValues: string[];
    onSelect: (values: string[]) => void;
}> = ({ project, parent, onSelect, selectedValues }) => {
    const { parentVariantOptions } = useParentVariantOptions(project, parent);
    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
    const checkedIcon = <CheckBoxIcon fontSize='small' />;
    return (
        <StyledAutocomplete
            multiple
            id='parent-variant-options'
            options={parentVariantOptions}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {option}
                </li>
            )}
            renderInput={(params) => (
                <TextField {...params} placeholder='Select values' />
            )}
            fullWidth
            value={selectedValues}
            onChange={(_, selectedValues) => {
                onSelect(selectedValues as string[]);
            }}
        />
    );
};
