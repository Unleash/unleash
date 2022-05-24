import { styled, Button } from '@mui/material';
import { colors } from 'themes/colors';
import { IInstanceStatus, InstanceState } from 'interfaces/instance';
import { differenceInDays, parseISO } from 'date-fns';
import { INSTANCE_STATUS_BAR_ID } from 'utils/testIds';
import { Info } from '@mui/icons-material';

interface IInstanceStatusBarProps {
    instanceStatus: IInstanceStatus;
}

export const InstanceStatusBar = ({
    instanceStatus,
}: IInstanceStatusBarProps) => {
    const trialDaysRemaining = calculateTrialDaysRemaining(instanceStatus);

    if (
        instanceStatus.state === InstanceState.TRIAL &&
        typeof trialDaysRemaining === 'number' &&
        trialDaysRemaining <= 0
    ) {
        return (
            <StyledBar data-testid={INSTANCE_STATUS_BAR_ID}>
                <StyledInfoIcon />
                <span>
                    <strong>Heads up!</strong> Your free trial of the{' '}
                    {instanceStatus.plan.toUpperCase()} version has expired.
                </span>
                <ContactButton />
            </StyledBar>
        );
    }

    if (
        instanceStatus.state === InstanceState.TRIAL &&
        typeof trialDaysRemaining === 'number' &&
        trialDaysRemaining <= 10
    ) {
        return (
            <StyledBar data-testid={INSTANCE_STATUS_BAR_ID}>
                <StyledInfoIcon />
                <span>
                    <strong>Heads up!</strong> You have{' '}
                    <strong>{trialDaysRemaining} days</strong> remaining of your
                    free trial of the {instanceStatus.plan.toUpperCase()}{' '}
                    version.
                </span>
                <ContactButton />
            </StyledBar>
        );
    }

    return null;
};

const ContactButton = () => {
    return (
        <StyledButton
            href="mailto:support@getunleash.zendesk.com"
            variant="outlined"
        >
            Contact us
        </StyledButton>
    );
};

const calculateTrialDaysRemaining = (
    instanceStatus: IInstanceStatus
): number | undefined => {
    return instanceStatus.trialExpiry
        ? differenceInDays(parseISO(instanceStatus.trialExpiry), new Date())
        : undefined;
};

// TODO - Cleanup to use theme instead of colors
const StyledBar = styled('aside')(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    gap: theme.spacing(1),
    borderBottom: '1px solid',
    borderColor: colors.blue[200],
    background: colors.blue[50],
    color: colors.blue[700],
}));

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    minWidth: '8rem',
    marginLeft: theme.spacing(2),
}));

// TODO - Cleanup to use theme instead of colors
const StyledInfoIcon = styled(Info)(({ theme }) => ({
    color: colors.blue[500],
}));
