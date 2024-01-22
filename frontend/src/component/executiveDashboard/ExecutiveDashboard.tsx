import { Box, Paper, styled, Typography } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { VFC } from 'react';
import { UsersChart } from './UsersChart/UsersChart';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(600px, 1fr))`,
    gridAutoRows: '1fr',
    gap: theme.spacing(2),
}));

export const ExecutiveDashboard: VFC = () => {
    return (
        <>
            <Box sx={(theme) => ({ paddingBottom: theme.spacing(4) })}>
                <PageHeader
                    titleElement={
                        <Typography variant='h1' component='h2'>
                            Dashboard
                        </Typography>
                    }
                    // subtitle='Succesfully synchronized: 01 Sep 2023 - 07:05:07'
                />
            </Box>
            {/* Dashboard */}
            <StyledGrid>
                <Paper>Stats</Paper>
                <UsersChart />
            </StyledGrid>
        </>
    );
};
