import { Box, Paper, styled, Typography } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { VFC } from 'react';
import { UsersChart } from './UsersChart/UsersChart';
import { FlagsChart } from './FlagsChart/FlagsChart';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(600px, 1fr))`,
    gridAutoRows: '1fr',
    gap: theme.spacing(2),
}));

export const ExecutiveDashboard: VFC = () => {
    const { executiveDashboardData, loading, error } = useExecutiveDashboard();

    return (
        <>
            <Box sx={(theme) => ({ paddingBottom: theme.spacing(4) })}>
                <PageHeader
                    titleElement={
                        <Typography variant='h1' component='h2'>
                            Dashboard
                        </Typography>
                    }
                />
            </Box>
            <StyledGrid>
                <Paper>Stats</Paper>
                <UsersChart
                    userTrends={executiveDashboardData?.userTrends ?? []}
                />
                <FlagsChart
                    flagsTrends={executiveDashboardData?.flagsTrends ?? []}
                />
            </StyledGrid>
        </>
    );
};
