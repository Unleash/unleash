import type { FC } from 'react';
import { Box, Button, Link, styled, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import InsightsIcon from '@mui/icons-material/Insights';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadiusLarge,
    border: `1px dashed ${theme.palette.divider}`,
    textAlign: 'center',
    gap: theme.spacing(2),
}));

const StyledIconContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(10),
    height: theme.spacing(10),
    borderRadius: '50%',
    backgroundColor: theme.palette.background.elevation1,
    marginBottom: theme.spacing(1),
}));

const StyledInsightsIcon = styled(InsightsIcon)(({ theme }) => ({
    fontSize: theme.spacing(5),
    color: theme.palette.primary.main,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
}));

const StyledDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    color: theme.palette.text.secondary,
    maxWidth: 480,
    lineHeight: 1.6,
}));

const StyledSteps = styled('ol')(({ theme }) => ({
    textAlign: 'left',
    margin: theme.spacing(2, 0),
    paddingLeft: theme.spacing(3),
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 2,
}));

const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

interface ImpactEmptyStateProps {
    onAddChart: () => void;
}

export const ImpactEmptyState: FC<ImpactEmptyStateProps> = ({ onAddChart }) => {
    return (
        <StyledContainer>
            <StyledIconContainer>
                <StyledInsightsIcon />
            </StyledIconContainer>
            <StyledTitle>Measure your feature's impact</StyledTitle>
            <StyledDescription>
                Impact metrics help you understand how your feature affects key
                business metrics like conversion rates, error rates, and
                performance. Connect the dots between your rollout decisions and
                real-world outcomes.
            </StyledDescription>
            <StyledSteps>
                <li>Instrument your application with Unleash SDK</li>
                <li>Send custom metrics tied to feature flag evaluations</li>
                <li>Add charts to visualize the impact here</li>
            </StyledSteps>
            <StyledActions>
                <Link
                    href='https://docs.getunleash.io/reference/impact-metrics'
                    target='_blank'
                    rel='noopener noreferrer'
                    underline='hover'
                >
                    Learn more about impact metrics
                </Link>
                <Button
                    variant='contained'
                    startIcon={<Add />}
                    onClick={onAddChart}
                >
                    Add your first chart
                </Button>
            </StyledActions>
        </StyledContainer>
    );
};
