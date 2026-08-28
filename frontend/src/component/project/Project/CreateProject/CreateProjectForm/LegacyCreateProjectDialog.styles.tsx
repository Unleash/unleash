import { styled } from '@mui/material';

export const StyledDefinitionList = styled('dl')(({ theme }) => ({
    dt: {
        fontWeight: 'bold',
        '&:after': {
            content: '":"',
        },
    },

    'dd + dt': {
        marginBlockStart: theme.spacing(1),
    },
}));
