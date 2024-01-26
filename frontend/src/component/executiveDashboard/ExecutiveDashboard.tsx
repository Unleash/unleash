import { Box, Paper, styled, Typography } from '@mui/material';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { VFC } from 'react';
import { UsersChart } from './UsersChart/UsersChart';
import { FlagsChart } from './FlagsChart/FlagsChart';
import { useExecutiveDashboard } from 'hooks/api/getters/useExecutiveSummary/useExecutiveSummary';
import { UserStats } from './UserStats/UserStats';
import { FlagStats } from './FlagStats/FlagStats';

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: `300px 1fr`,
    // TODO: responsive grid size
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
                <UserStats />
                <FlagStats />
                <UsersChart
                    userTrends={executiveDashboardData?.userTrends ?? []}
                />
                <Paper>Stats</Paper>
                <FlagsChart
                    flagsTrends={executiveDashboardData?.flagsTrends ?? []}
                />
            </StyledGrid>
        </>
    );
};
