import { FC } from 'react';
import { InputAdornment, TextField, styled } from '@mui/material';
import { Search } from '@mui/icons-material';

interface IFilterItemSearchProps {
    value: string;
    setValue: (value: string) => void;
}

export const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputBase-root': {
        padding: theme.spacing(0, 1.5),
        borderRadius: `${theme.shape.borderRadiusMedium}px`,
    },
    '& .MuiInputBase-input': {
        padding: theme.spacing(0.75, 0),
        fontSize: theme.typography.body2.fontSize,
    },
}));

export const FilterItemSearch: FC<IFilterItemSearchProps> = ({
    value,
    setValue,
}) => {
    return (
        <StyledTextField
            variant='outlined'
            size='small'
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder='Search'
            InputProps={{
                startAdornment: (
                    <InputAdornment position='start'>
                        <Search fontSize='small' />
                    </InputAdornment>
                ),
            }}
        />
    );
};
