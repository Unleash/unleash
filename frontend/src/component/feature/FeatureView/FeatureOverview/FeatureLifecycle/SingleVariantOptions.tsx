import { Autocomplete, Checkbox, styled, TextField } from '@mui/material';
import type { FC } from 'react';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useParentVariantOptions } from 'hooks/api/getters/useFeatureDependencyOptions/useFeatureDependencyOptions';

const StyledAutocomplete = styled(Autocomplete<string>)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));

export const SingleVariantOptions: FC<{
    project: string;
    parent: string;
    onSelect: (value: string) => void;
}> = ({ project, parent, onSelect }) => {
    const { parentVariantOptions: variantOptions } = useParentVariantOptions(
        project,
        parent,
    );
    const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
    const checkedIcon = <CheckBoxIcon fontSize='small' />;
    return (
        <StyledAutocomplete
            id='single-variant-options'
            options={variantOptions}
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
                <TextField {...params} placeholder='Select variant' />
            )}
            fullWidth
            onChange={(_, selectedValue) => {
                onSelect(String(selectedValue));
            }}
        />
    );
};
