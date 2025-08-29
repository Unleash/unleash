import type { FC } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import { StatsExplanation } from 'component/insights/InsightsCharts.styles';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import type { InstanceInsightsSchema } from 'openapi';
import { Link } from 'react-router-dom';

function getCurrentArchiveRatio(
    groupedCreationArchiveData: GroupedDataByProject<
        InstanceInsightsSchema['creationArchiveTrends']
    >,
) {
    if (!groupedCreationArchiveData) {
        return 0;
    }

    let totalArchived = 0;
    let totalCreated = 0;

    Object.values(groupedCreationArchiveData).forEach((projectData) => {
        const latestData = projectData[0];
        if (latestData) {
            totalArchived += latestData.archivedFlags || 0;
            const createdSum = latestData.createdFlags
                ? Object.values(latestData.createdFlags).reduce(
                      (sum: number, count: number) => sum + count,
                      0,
                  )
                : 0;
            totalCreated += createdSum;
        }
    });

    const rawRatio = Math.round((totalArchived / totalCreated) * 100);
    return Number.isNaN(rawRatio) ? 100 : Math.min(rawRatio, 100);
}

const StyledRatioContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
}));

const StyledPercentageRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledRatioTypography = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontSize: theme.spacing(2.5),
    fontWeight: 'bold',
}));

const StyledInfoIcon = styled(InfoOutlined)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledLink = styled(Link)(({ theme }) => ({
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
    fontSize: theme.spacing(1.75),
}));

interface CreationArchiveStatsProps {
    groupedCreationArchiveData: GroupedDataByProject<
        InstanceInsightsSchema['creationArchiveTrends']
    >;
    isLoading?: boolean;
}

export const CreationArchiveStats: FC<CreationArchiveStatsProps> = ({
    groupedCreationArchiveData,
    isLoading,
}) => {
    const currentRatio = getCurrentArchiveRatio(groupedCreationArchiveData);

    return (
        <>
            <StyledRatioContainer>
                <StyledPercentageRow>
                    <StyledRatioTypography>
                        {isLoading ? '...' : `${currentRatio}%`}
                    </StyledRatioTypography>
                    <HelpIcon tooltip='Ratio of archived flags to created flags'>
                        <StyledInfoIcon />
                    </HelpIcon>
                </StyledPercentageRow>
                <Typography variant='body2'>Current ratio</Typography>
            </StyledRatioContainer>
            <StatsExplanation>
                <Lightbulb color='primary' />
                Do you create more flags than you archive? Or do you have good
                process for cleaning up?
            </StatsExplanation>
            <StyledLink to='/search?lifecycle=IS:completed'>
                View flags in cleanup stage
            </StyledLink>
        </>
    );
};
