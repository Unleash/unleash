import type { FC, ReactNode } from 'react';
import { Box, Typography, styled } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Lightbulb from '@mui/icons-material/LightbulbOutlined';
import { StatsExplanation } from 'component/insights/InsightsCharts.styles';
import { Link } from 'react-router-dom';

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

interface StatCardProps {
    value: string | number;
    label: string;
    tooltip: string;
    explanation: ReactNode;
    link?: {
        to: string;
        text: string;
    };
    isLoading?: boolean;
}

export const StatCard: FC<StatCardProps> = ({
    value,
    label,
    tooltip,
    explanation,
    link,
    isLoading,
}) => {
    return (
        <>
            <StyledRatioContainer>
                <StyledPercentageRow>
                    <StyledRatioTypography>
                        {isLoading ? '...' : value}
                    </StyledRatioTypography>
                    <HelpIcon tooltip={tooltip}>
                        <StyledInfoIcon />
                    </HelpIcon>
                </StyledPercentageRow>
                <Typography variant='body2'>{label}</Typography>
            </StyledRatioContainer>
            <StatsExplanation>
                <Lightbulb color='primary' />
                {explanation}
            </StatsExplanation>
            {link && <StyledLink to={link.to}>{link.text}</StyledLink>}
        </>
    );
};
