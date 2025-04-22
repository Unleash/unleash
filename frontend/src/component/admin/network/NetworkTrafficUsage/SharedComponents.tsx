import styled from '@mui/material/styles/styled';
import Box from '@mui/system/Box';

export const StyledBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gap: theme.spacing(5),
}));

export const TopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'space-between',
    gap: theme.spacing(2, 4),
    alignItems: 'start',
}));

export const BoldText = styled('span')(({ theme }) => ({
    fontWeight: 'bold',
}));
