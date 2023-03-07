import { Box, Checkbox, styled } from '@mui/material';
import { FC } from 'react';

interface IRowSelectCellProps {
    onChange: () => void;
    checked: boolean;
    title: string;
}

const StyledBoxCell = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    paddingLeft: theme.spacing(2),
}));

export const RowSelectCell: FC<IRowSelectCellProps> = ({
    onChange,
    checked,
    title,
}) => (
    <StyledBoxCell>
        <Checkbox onChange={onChange} title={title} checked={checked} />
    </StyledBoxCell>
);
