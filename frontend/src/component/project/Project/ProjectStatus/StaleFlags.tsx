import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material';

const DescriptionText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
}));

export const StaleFlags = () => (
    <Box gridArea='stale' sx={{ background: 'grey' }}>
        <Typography variant='h3'>6 Stale flags</Typography>
        <DescriptionText variant='body2'>
            Remember to archive your stale feature flags to keep the project
            health
        </DescriptionText>
    </Box>
);
