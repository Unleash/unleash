import { ReactComponent as ProPlanIcon } from 'assets/icons/pro-enterprise-feature-badge.svg';
import { ReactComponent as ProPlanIconLight } from 'assets/icons/pro-enterprise-feature-badge-light.svg';
import { Box, Button, Link, styled, Typography } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { ThemeMode } from '../ThemeMode/ThemeMode';
import { PageContent } from '../PageContent/PageContent';
import { PageHeader } from '../PageHeader/PageHeader';

const PremiumFeatureWrapper = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'tooltip',
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
    shouldForwardProp: (prop) => prop !== 'tooltip',
})<{ tooltip?: boolean }>(({ theme, tooltip }) => ({
    margin: tooltip ? theme.spacing(1, 0) : theme.spacing(3, 0, 5, 0),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledButtonContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1.5),
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
    'service-accounts': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/service-accounts',
        label: 'Service Accounts',
    },
    'project-roles': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/rbac#custom-project-roles',
        label: 'Project Roles',
    },
    'login-history': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/login-history',
        label: 'Login history',
    },
    groups: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/rbac#user-groups',
        label: 'User groups',
    },
    sso: {
        plan: FeaturePlan.PRO,
        url: 'https://docs.getunleash.io/reference/rbac#user-group-sso-integration',
        label: 'Single Sign-On',
    },
    'project-settings': {
        plan: FeaturePlan.PRO,
        url: 'https://docs.getunleash.io/reference/projects',
        label: 'Project settings',
    },
    banners: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/banners',
        label: 'Banners',
    },
    signals: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/signals',
        label: 'Signals',
    },
    actions: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/actions',
        label: 'Actions',
    },
    dashboard: {
        plan: FeaturePlan.ENTERPRISE,
        url: '', // FIXME: url
        label: 'Dashboard',
    },
    'inactive-users': {
        plan: FeaturePlan.ENTERPRISE,
        url: '',
        label: 'Automatic clean-up of inactive users',
    },
    environments: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/reference/environments',
        label: 'Environments management',
    },
};

type PremiumFeatureType = keyof typeof PremiumFeatures;

const UPGRADE_URL = 'https://www.getunleash.io/plans';

export interface PremiumFeatureProps {
    feature: PremiumFeatureType;
    tooltip?: boolean;
    page?: boolean;
}

export const PremiumFeature = ({
    feature,
    tooltip,
    page,
}: PremiumFeatureProps) => {
    const { url, plan, label } = PremiumFeatures[feature];

    const tracker = usePlausibleTracker();

    const trackUpgradePlan = () => {
        tracker.trackEvent('upgrade_plan_clicked', {
            props: { feature: label },
        });
    };

    const trackReadAbout = () => {
        tracker.trackEvent('read_about', {
            props: { feature: label },
        });
    };

    const featureLabel = url ? (
        <StyledLink href={url} target='_blank' rel='noreferrer'>
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

    const content = (
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
                                if you want to use it.
                            </StyledTypography>
                        </StyledBody>
                        <StyledButtonContainer>
                            <StyledLink
                                href={upgradeUrl}
                                target='_blank'
                                rel='noreferrer'
                                onClick={trackUpgradePlan}
                            >
                                Compare plans
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
                                it.
                            </StyledTypography>
                        </StyledBody>
                        <StyledButtonContainer>
                            <Button
                                variant='contained'
                                href={upgradeUrl}
                                target='_blank'
                                rel='noreferrer'
                                onClick={trackUpgradePlan}
                            >
                                Compare plans
                            </Button>
                            <Button
                                href={url}
                                target='_blank'
                                rel='noreferrer'
                                onClick={trackReadAbout}
                            >
                                Read about {label}
                            </Button>
                        </StyledButtonContainer>
                    </>
                }
            />
        </PremiumFeatureWrapper>
    );

    if (page) {
        return (
            <PageContent header={<PageHeader title={label} />}>
                {content}
            </PageContent>
        );
    }

    return content;
};
