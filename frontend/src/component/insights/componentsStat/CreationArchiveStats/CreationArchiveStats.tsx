import type { FC } from 'react';
import { Box, Typography, Link, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import { StatsExplanation } from 'component/insights/InsightsCharts.styles';

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
    currentRatio: number;
    isLoading?: boolean;
}

export const CreationArchiveStats: FC<CreationArchiveStatsProps> = ({
    currentRatio,
    isLoading,
}) => {
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
