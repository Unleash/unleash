import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Checkbox, styled } from '@mui/material';

const SelectOptionCheckbox = styled(Checkbox)(({ theme }) => ({
    marginRight: theme.spacing(0.4),
}));

export const renderOption = (
    props: object,
    option: { label: string },
    { selected }: { selected: boolean },
) => (
    <li {...props}>
        <SelectOptionCheckbox
            icon={<CheckBoxOutlineBlankIcon fontSize='small' />}
            checkedIcon={<CheckBoxIcon fontSize='small' />}
            checked={selected}
        />
        {option.label}
    </li>
);
