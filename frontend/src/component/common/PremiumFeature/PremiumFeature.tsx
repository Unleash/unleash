import ProPlanIcon from 'assets/icons/pro-enterprise-feature-badge.svg?react';
import ProPlanIconLight from 'assets/icons/pro-enterprise-feature-badge-light.svg?react';
import { Box, Button, Link, styled, Typography } from '@mui/material';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender.tsx';
import { ThemeMode } from '../ThemeMode/ThemeMode.tsx';
import { PageContent } from '../PageContent/PageContent.tsx';
import { PageHeader } from '../PageHeader/PageHeader.tsx';

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
        plan: FeaturePlan.ENTERPRISE,
        url: '',
        label: 'Adding new projects',
    },
    access: {
        plan: FeaturePlan.PRO,
        url: 'https://docs.getunleash.io/concepts/rbac',
        label: 'Access',
    },
    'change-requests': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/change-requests',
        label: 'Change Requests',
    },
    'service-accounts': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/service-accounts',
        label: 'Service Accounts',
    },
    'project-roles': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/rbac#custom-project-roles',
        label: 'Project Roles',
    },
    'login-history': {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/login-history',
        label: 'Login history',
    },
    groups: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/rbac#user-groups',
        label: 'User groups',
    },
    sso: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/rbac#user-group-sso-integration',
        label: 'Single Sign-On',
    },
    'project-settings': {
        plan: FeaturePlan.PRO,
        url: 'https://docs.getunleash.io/concepts/projects',
        label: 'Project settings',
    },
    banners: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/banners',
        label: 'Banners',
    },
    signals: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/signals',
        label: 'Signals',
    },
    actions: {
        plan: FeaturePlan.ENTERPRISE,
        url: 'https://docs.getunleash.io/concepts/actions',
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
        url: 'https://docs.getunleash.io/concepts/environments',
        label: 'Environments management',
    },
    releaseManagement: {
        plan: FeaturePlan.ENTERPRISE,
        url: '',
        label: 'Release templates',
    },
};

type PremiumFeatureType = keyof typeof PremiumFeatures;

const PLANS_URL = 'https://www.getunleash.io/plans';
const UPGRADE_URL = 'https://www.getunleash.io/upgrade-unleash';

export interface PremiumFeatureProps {
    feature: PremiumFeatureType;
    tooltip?: boolean;
    page?: boolean;
    mode?: 'plans' | 'upgrade';
}

export const PremiumFeature = ({
    feature,
    tooltip,
    page,
    mode = 'plans',
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

    const plansUrl = `${PLANS_URL}?feature=${feature}`;
    const upgradeUrl = `${UPGRADE_URL}?utm_medium=feature&utm_content=${feature}`;

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
                            {mode === 'plans' ? (
                                <StyledLink
                                    href={plansUrl}
                                    target='_blank'
                                    onClick={trackUpgradePlan}
                                >
                                    Compare plans
                                </StyledLink>
                            ) : (
                                <StyledLink
                                    href={upgradeUrl}
                                    target='_blank'
                                    onClick={trackUpgradePlan}
                                >
                                    View our Enterprise offering
                                </StyledLink>
                            )}
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
                            {mode === 'plans' ? (
                                <Button
                                    variant='contained'
                                    href={plansUrl}
                                    target='_blank'
                                    onClick={trackUpgradePlan}
                                >
                                    Compare plans
                                </Button>
                            ) : (
                                <Button
                                    variant='contained'
                                    href={upgradeUrl}
                                    target='_blank'
                                    onClick={trackUpgradePlan}
                                >
                                    View our Enterprise offering
                                </Button>
                            )}

                            {url && (
                                <Button
                                    href={url}
                                    target='_blank'
                                    rel='noreferrer'
                                    onClick={trackReadAbout}
                                >
                                    Read about {label}
                                </Button>
                            )}
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
