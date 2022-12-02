import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { Box, Link, styled, Typography } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const ProFeatureTooltipWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1, 0.5),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.smallBody,
    gap: theme.spacing(1),
}));

const StyledBody = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    margin: theme.spacing(1, 0),
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    width: 'fit-content',
}));

export interface ProFeatureTooltipProps {
    children: React.ReactNode;
    title: string;
    origin: string;
    center?: boolean;
}

export const ProFeatureTooltip = ({
    title,
    origin,
    children,
    center,
}: ProFeatureTooltipProps) => {
    const tracker = usePlausibleTracker();
    const handleClick = () => {
        if (origin) {
            tracker.trackEvent('upgrade_plan_clicked', {
                props: { origin: origin },
            });
        }
    };
    return (
        <ProFeatureTooltipWrapper
            sx={{
                alignItems: center ? 'center' : 'start',
                textAlign: center ? 'center' : 'left',
            }}
        >
            <StyledTitle>
                <ProPlanIcon />
                {title}
            </StyledTitle>
            <StyledBody>{children}</StyledBody>
            <StyledLink
                href={'https://www.getunleash.io/plans'}
                target="_blank"
                onClick={handleClick}
            >
                Upgrade now
            </StyledLink>
        </ProFeatureTooltipWrapper>
    );
};
