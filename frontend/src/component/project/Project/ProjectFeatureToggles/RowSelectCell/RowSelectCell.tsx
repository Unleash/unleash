import { Box, Checkbox, styled } from '@mui/material';
import { FC } from 'react';
import { BATCH_SELECT } from 'utils/testIds';

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
    <StyledBoxCell data-testid={BATCH_SELECT}>
        <Checkbox onChange={onChange} title={title} checked={checked} />
    </StyledBoxCell>
);
