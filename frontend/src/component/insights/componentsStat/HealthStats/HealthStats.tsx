import type { FC, ReactNode } from 'react';
import { Box, Divider, styled } from '@mui/material';
import { ReactComponent as InstanceHealthIcon } from 'assets/icons/instance-health.svg';

interface IHealthStatsProps {
    value?: string | number;
    healthy: number;
    stale: number;
    potentiallyStale: number;
    title?: ReactNode;
}

const StyledStatsRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 2, 0.5, 2),
}));

const StyledIcon = styled(InstanceHealthIcon)(({ theme }) => ({
    color: theme.palette.primary.light,
    marginRight: theme.spacing(1.5),
}));

const StyledValue = styled(Box)(({ theme }) => ({
    display: 'block',
    marginLeft: 'auto',
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.fontSizes.mediumHeader,
}));

const StyledSection = styled('div')(({ theme }) => ({
    padding: theme.spacing(3),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledHeader = styled('div')(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const StyledMainValue = styled(StyledValue)(({ theme }) => ({
    fontSize: theme.fontSizes.largeHeader,
}));

export const HealthStats: FC<IHealthStatsProps> = ({
    value,
    healthy,
    stale,
    potentiallyStale,
    title,
}) => (
    <div>
        <StyledHeader>
            <StyledSection>{title}</StyledSection>
            <StyledSection>{/* TODO: trend */}</StyledSection>
        </StyledHeader>
        <Divider />
        <StyledSection>
            <StyledStatsRow>
                <StyledIcon />
                Instance health
                <StyledMainValue>{`${value}%`}</StyledMainValue>
            </StyledStatsRow>
        </StyledSection>
        <Divider />
        <StyledSection>
            <StyledStatsRow>
                Healthy flags
                <StyledValue>{healthy}</StyledValue>
            </StyledStatsRow>
            <StyledStatsRow>
                Stale flags
                <StyledValue>{stale}</StyledValue>
            </StyledStatsRow>
            <StyledStatsRow>
                Potencially stale flags
                <StyledValue>{potentiallyStale}</StyledValue>
            </StyledStatsRow>
        </StyledSection>
    </div>
);
