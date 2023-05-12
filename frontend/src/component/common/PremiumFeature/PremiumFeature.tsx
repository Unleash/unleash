import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';
import { Box, Button, Link, styled, Typography } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { ThemeMode } from '../ThemeMode/ThemeMode';

const PremiumFeatureWrapper = styled(Box, {
    shouldForwardProp: prop => prop !== 'tooltip',
})<{ tooltip?: boolean }>(({ theme, tooltip }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: tooltip ? 'start' : 'center',
    textAlign: tooltip ? 'left' : 'center',
    backgroundColor: tooltip
        ? 'transparent'
        : theme.palette.background.elevation2,
    borderRadius: tooltip ? 0 : theme.shape.borderRadiusLarge,
    padding: tooltip ? theme.spacing(1, 0.5) : theme.spacing(7.5, 1),
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: theme.fontWeight.bold,
    gap: theme.spacing(1),
}));

const StyledBody = styled('div', {
    shouldForwardProp: prop => prop !== 'tooltip',
})<{ tooltip?: boolean }>(({ theme, tooltip }) => ({
    margin: tooltip ? theme.spacing(1, 0) : theme.spacing(3, 0, 5, 0),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledButtonContainer = styled('div')(() => ({
    display: 'flex',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

enum FeaturePlan {
    PRO = 'Pro & Enterprise',
    ENTERPRISE = 'Enterprise',
}

const PremiumFeatures = {
    'adding-new-projects': {
        plan: FeaturePlan.PRO,
        url: '',
        label: 'Adding new projects',
    },
    access: {
        plan: FeaturePlan.PRO,
        url: 'https://docs.getunleash.io/reference/rbac',
        label: 'Access',
    },
    'change-requests': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/change-requests',
        label: 'Change Requests',
    },
    segments: {
        plan: FeaturePlan.PRO,
        url: 'https://docs.getunleash.io/reference/segments',
        label: 'Segments',
    },
};

type PremiumFeatureType = keyof typeof PremiumFeatures;

const UPGRADE_URL = 'https://www.getunleash.io/plans';

export interface PremiumFeatureProps {
    feature: PremiumFeatureType;
    tooltip?: boolean;
}

export const PremiumFeature = ({ feature, tooltip }: PremiumFeatureProps) => {
    const { url, plan, label } = PremiumFeatures[feature];

    const tracker = usePlausibleTracker();

    const handleClick = () => {
        tracker.trackEvent('upgrade_plan_clicked', {
            props: { feature: label },
        });
    };

    const featureLabel = Boolean(url) ? (
        <StyledLink href={url} target="_blank" rel="noreferrer">
            {label}
        </StyledLink>
    ) : (
        label
    );

    const featureMessage = (
        <>
            {featureLabel} is a feature available for the{' '}
            <strong>{plan}</strong>{' '}
            {plan === FeaturePlan.PRO ? 'plans' : 'plan'}
        </>
    );

    const upgradeUrl = `${UPGRADE_URL}?feature=${feature}`;

    return (
        <PremiumFeatureWrapper tooltip={tooltip}>
            <StyledTitle>
                <ThemeMode
                    darkmode={<ProPlanIconLight />}
                    lightmode={<ProPlanIcon />}
                />
                {`${plan} feature`}
            </StyledTitle>
            <ConditionallyRender
                condition={Boolean(tooltip)}
                show={
                    <>
                        <StyledBody tooltip>
                            <StyledTypography>
                                {featureMessage}. You need to upgrade your plan
                                if you want to use it
                            </StyledTypography>
                        </StyledBody>
                        <StyledButtonContainer>
                            <StyledLink
                                href={upgradeUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleClick}
                            >
                                Upgrade now
                            </StyledLink>
                        </StyledButtonContainer>
                    </>
                }
                elseShow={
                    <>
                        <StyledBody>
                            <StyledTypography>
                                {featureMessage}
                            </StyledTypography>
                            <StyledTypography>
                                You need to upgrade your plan if you want to use
                                it
                            </StyledTypography>
                        </StyledBody>
                        <StyledButtonContainer>
                            <Button
                                variant="outlined"
                                href={upgradeUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={handleClick}
                            >
                                Upgrade now
                            </Button>
                        </StyledButtonContainer>
                    </>
                }
            />
        </PremiumFeatureWrapper>
    );
};
