import type { FC } from 'react';
import { styled, Typography } from '@mui/material';
import { FeatureOverviewEnvironments } from '../FeatureOverview/FeatureOverviewEnvironments/FeatureOverviewEnvironments';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
}));

interface StrategySectionProps {
    hiddenEnvironments?: string[];
}

export const StrategySection: FC<StrategySectionProps> = ({
    hiddenEnvironments,
}) => {
    return (
        <StyledContainer>
            <StyledHeader>
                <StyledTitle>Strategies</StyledTitle>
            </StyledHeader>
            <FeatureOverviewEnvironments
                hiddenEnvironments={hiddenEnvironments}
            />
        </StyledContainer>
    );
};
