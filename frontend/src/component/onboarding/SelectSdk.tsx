import { Box, styled, Typography } from '@mui/material';

const SpacedContainer = styled('div')(({ theme }) => ({
    padding: theme.spacing(5, 8, 3, 8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const SectionHeader = styled('div')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
    fontSize: theme.fontSizes.bodySize,
}));

export const SelectSdk = () => {
    return (
        <SpacedContainer>
            <Typography variant='h2'>Connect an SDK to Unleash</Typography>
            <Box sx={{ mt: 4 }}>
                <SectionHeader>Select SDK</SectionHeader>
            </Box>
        </SpacedContainer>
    );
};

export const SelectSdkConcepts = () => {};
