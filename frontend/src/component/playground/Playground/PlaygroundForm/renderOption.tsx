import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Checkbox, styled } from '@mui/material';
import type { HTMLAttributes, Key } from 'react';

const SelectOptionCheckbox = styled(Checkbox)(({ theme }) => ({
    marginRight: theme.spacing(0.4),
}));

export const renderOption = (
    props: HTMLAttributes<HTMLLIElement> & { key?: Key },
    option: { label: string },
    { selected }: { selected: boolean },
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
