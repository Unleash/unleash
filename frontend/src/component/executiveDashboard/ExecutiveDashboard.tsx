import { Box, styled, Typography } from '@mui/material';
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
    gridAutoRows: 'auto',
    gap: theme.spacing(2),
}));

export const ExecutiveDashboard: VFC = () => {
    const { executiveDashboardData, loading, error } = useExecutiveDashboard();

    const calculateFlagPerUsers = () => {
        if (
            executiveDashboardData.users.total === 0 ||
            executiveDashboardData.flags.total === 0
        )
            return '0';

        return (
            executiveDashboardData.flags.total /
            executiveDashboardData.users.total
        ).toFixed(1);
    };

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
                <UserStats count={executiveDashboardData.users.total} />
                <FlagStats
                    count={executiveDashboardData.flags.total}
                    flagsPerUser={calculateFlagPerUsers()}
                />
                <UsersChart userTrends={executiveDashboardData.userTrends} />
                <FlagsChart flagTrends={executiveDashboardData.flagTrends} />
            </StyledGrid>
        </>
    );
};
