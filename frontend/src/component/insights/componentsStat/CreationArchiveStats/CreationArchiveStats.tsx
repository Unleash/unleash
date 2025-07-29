import type { FC } from 'react';
import { Box, Typography, Link, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import { StatsExplanation } from 'component/insights/InsightsCharts.styles';
import type { GroupedDataByProject } from 'component/insights/hooks/useGroupedProjectTrends';
import type { InstanceInsightsSchema } from 'openapi';

function getCurrentArchiveRatio(
    groupedCreationArchiveData: GroupedDataByProject<
        InstanceInsightsSchema['creationArchiveTrends']
    >,
) {
    if (
        !groupedCreationArchiveData ||
        Object.keys(groupedCreationArchiveData).length === 0
    ) {
        return 0;
    }

    let totalArchived = 0;
    let totalCreated = 0;

    Object.values(groupedCreationArchiveData).forEach((projectData) => {
        const latestData = projectData[projectData.length - 1];
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

    return totalCreated > 0
        ? Math.round((totalArchived / totalCreated) * 100)
        : 0;
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
    fontFamily: 'inherit',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: 700,
    lineHeight: '28px',
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
            <StyledLink href='/search?lifecycle=IS:completed' variant='body2'>
                View flags in cleanup stage
            </StyledLink>
        </>
    );
};
