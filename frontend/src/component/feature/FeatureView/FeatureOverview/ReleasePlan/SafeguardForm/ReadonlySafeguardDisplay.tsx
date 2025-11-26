import ShieldIcon from '@mui/icons-material/Shield';
import { styled } from '@mui/material';
import type { ISafeguard } from 'interfaces/releasePlans';

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

const StyledIcon = styled(ShieldIcon)(({ theme }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor: theme.palette.warning.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const StyledValue = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
}));

interface ReadonlySafeguardDisplayProps {
    safeguard: ISafeguard;
}

export const ReadonlySafeguardDisplay = ({
    safeguard,
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
        </StyledDisplayContainer>
    );
};
