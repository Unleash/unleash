import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import { styled } from '@mui/material';
import type { ReactNode } from 'react';
import type { ISafeguard } from 'interfaces/releasePlans';
import { createStyledIcon } from '../shared/SharedFormComponents.tsx';

const StyledDisplayContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    justifyContent: 'space-between',
    width: '100%',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledContentGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexWrap: 'wrap',
}));

const StyledIcon = createStyledIcon(ShieldIcon);

const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const StyledValue = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

interface ReadonlySafeguardDisplayProps {
    safeguard: ISafeguard;
    badge?: ReactNode;
}

export const ReadonlySafeguardDisplay = ({
    safeguard,
    badge,
}: ReadonlySafeguardDisplayProps) => {
    const appName = safeguard.impactMetric.labelSelectors.appName?.[0] || '*';
    const operator =
        safeguard.triggerCondition?.operator === '>'
            ? 'More than'
            : 'Less than';

    return (
        <StyledDisplayContainer>
            <StyledContentGroup>
                <StyledIcon />
                <StyledLabel>Pause automation when</StyledLabel>
                <StyledValue>{safeguard.impactMetric.metricName}</StyledValue>
                {appName !== '*' && (
                    <>
                        <StyledLabel>filtered by</StyledLabel>
                        <StyledValue>{appName}</StyledValue>
                    </>
                )}
                <StyledLabel>aggregated by</StyledLabel>
                <StyledValue>
                    {safeguard.impactMetric.aggregationMode}
                </StyledValue>
                <StyledLabel>is</StyledLabel>
                <StyledValue>
                    {operator} {safeguard.triggerCondition?.threshold}
                </StyledValue>
                <StyledLabel>over</StyledLabel>
                <StyledValue>{safeguard.impactMetric.timeRange}</StyledValue>
            </StyledContentGroup>
            {badge}
        </StyledDisplayContainer>
    );
};
