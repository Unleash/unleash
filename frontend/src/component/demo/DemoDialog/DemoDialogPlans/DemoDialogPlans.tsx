import { Button, Typography, styled } from '@mui/material';
import { DemoDialog } from '../DemoDialog';
import GitHub from '@mui/icons-material/GitHub';
import Launch from '@mui/icons-material/Launch';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    BILLING_PAYG_DEFAULT_MINIMUM_SEATS,
    BILLING_PAYG_USER_PRICE,
    BILLING_PLAN_PRICES,
    BILLING_PRO_DEFAULT_INCLUDED_SEATS,
} from 'component/admin/billing/BillingDashboard/BillingPlan/BillingPlan';
import { InstancePlan } from 'interfaces/instance';

const StyledDemoDialog = styled(DemoDialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        maxWidth: theme.spacing(120),
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(3.75),
            margin: theme.spacing(2.5),
        },
        [theme.breakpoints.down(768)]: {
            padding: theme.spacing(6, 4, 4, 4),
            margin: theme.spacing(2.5),
            '& > p': {
                fontSize: theme.typography.h1.fontSize,
            },
        },
    },
}));

const StyledPlans = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto auto auto',
    gap: theme.spacing(1),
    marginTop: theme.spacing(6),
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
        marginTop: theme.spacing(4.75),
    },
    [theme.breakpoints.down(768)]: {
        gridTemplateColumns: 'auto',
        marginTop: theme.spacing(3.5),
    },
}));

const StyledPlan = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(4, 3),
    '& > a': {
        whiteSpace: 'nowrap',
        [theme.breakpoints.between(768, 'md')]: {
            whiteSpace: 'normal',
            height: theme.spacing(6.25),
            lineHeight: 1.2,
        },
    },
    height: theme.spacing(34),
    width: theme.spacing(34),
    [theme.breakpoints.between(768, 'md')]: {
        height: theme.spacing(36),
        width: theme.spacing(27.5),
    },
}));

const StyledCompareLink = styled('a')(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    },
    margin: 'auto',
    marginTop: theme.spacing(4),
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& > svg': {
        fontSize: theme.fontSizes.mainHeader,
    },
}));

interface IDemoDialogPlansProps {
    open: boolean;
    onClose: () => void;
}

export const DemoDialogPlans = ({ open, onClose }: IDemoDialogPlansProps) => {
    const { trackEvent } = usePlausibleTracker();
    const isEnterprisePaygEnabled = useUiFlag('enterprise-payg');

    return (
        <StyledDemoDialog open={open} onClose={onClose}>
            <DemoDialog.Header>
                Want to keep going with Unleash?
            </DemoDialog.Header>
            <StyledPlans>
                <StyledPlan>
                    <Typography variant='h5' fontWeight='bold'>
                        Open Source
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                        Self-hosted basic feature management solution
                    </Typography>
                    <Typography variant='h6' fontWeight='normal'>
                        Free
                    </Typography>
                    <Button
                        variant='outlined'
                        color='primary'
                        startIcon={<GitHub />}
                        href='https://github.com/unleash/unleash'
                        target='_blank'
                        rel='noreferrer'
                        onClick={() => {
                            trackEvent('demo-see-plan', {
                                props: {
                                    plan: 'open_source',
                                },
                            });
                        }}
                    >
                        View project on GitHub
                    </Button>
                </StyledPlan>
                {isEnterprisePaygEnabled ? (
                    <StyledPlan>
                        <Typography variant='h5' fontWeight='bold'>
                            Enterprise
                            <br />
                            Pay-as-You-Go
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                            All the features of Enterprise with no long term
                            commitment.
                        </Typography>
                        <div>
                            <Typography variant='h6' fontWeight='normal'>
                                ${BILLING_PAYG_USER_PRICE} per user/month
                            </Typography>
                            <Typography variant='body2'>
                                {BILLING_PAYG_DEFAULT_MINIMUM_SEATS} users
                                minimum
                            </Typography>
                        </div>
                        <Button
                            variant='contained'
                            color='primary'
                            href='https://www.getunleash.io/plans/enterprise-payg'
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => {
                                trackEvent('demo-see-plan', {
                                    props: {
                                        plan: 'enterprise-starter',
                                    },
                                });
                            }}
                        >
                            Start 14-day free trial
                        </Button>
                    </StyledPlan>
                ) : (
                    <StyledPlan>
                        <Typography variant='h5' fontWeight='bold'>
                            Pro
                        </Typography>
                        <Typography variant='body2' color='textSecondary'>
                            Free your team to collaborate. We'll do the heavy
                            lifting.
                        </Typography>
                        <div>
                            <Typography variant='h6' fontWeight='normal'>
                                ${BILLING_PLAN_PRICES[InstancePlan.PRO]}/month
                            </Typography>
                            <Typography variant='body2'>
                                includes {BILLING_PRO_DEFAULT_INCLUDED_SEATS}{' '}
                                seats
                            </Typography>
                        </div>
                        <Button
                            variant='contained'
                            color='primary'
                            href='https://www.getunleash.io/plans/pro'
                            target='_blank'
                            rel='noreferrer'
                            onClick={() => {
                                trackEvent('demo-see-plan', {
                                    props: {
                                        plan: 'pro',
                                    },
                                });
                            }}
                        >
                            Start 14-day free trial
                        </Button>
                    </StyledPlan>
                )}
                <StyledPlan>
                    <Typography variant='h5' fontWeight='bold'>
                        Enterprise
                    </Typography>
                    <Typography variant='body2' color='textSecondary'>
                        Security, compliance, and development controls for
                        scale.
                    </Typography>
                    <div>
                        <Typography variant='h6' fontWeight='normal'>
                            Custom
                        </Typography>
                        <Typography variant='body2'>unlimited seats</Typography>
                    </div>
                    <Button
                        variant='contained'
                        color='web'
                        href='https://www.getunleash.io/plans/enterprise'
                        target='_blank'
                        rel='noreferrer'
                        onClick={() => {
                            trackEvent('demo-see-plan', {
                                props: {
                                    plan: 'enterprise',
                                },
                            });
                        }}
                    >
                        Contact sales
                    </Button>
                </StyledPlan>
            </StyledPlans>
            <StyledCompareLink
                href='https://www.getunleash.io/plans'
                target='_blank'
                rel='noreferrer'
                onClick={() => {
                    trackEvent('demo-see-plan', {
                        props: {
                            plan: 'compare_plans',
                        },
                    });
                }}
            >
                Compare plans <Launch />
            </StyledCompareLink>
        </StyledDemoDialog>
    );
};
