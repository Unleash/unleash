import { styled, Button, Typography } from '@mui/material';
import { IInstanceStatus, InstanceState } from 'interfaces/instance';
import { INSTANCE_STATUS_BAR_ID } from 'utils/testIds';
import { InfoOutlined, WarningAmber } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { calculateTrialDaysRemaining } from 'utils/billing';

interface IInstanceStatusBarProps {
    instanceStatus: IInstanceStatus;
}

export const InstanceStatusBar = ({
    instanceStatus,
}: IInstanceStatusBarProps) => {
    const { hasAccess } = useContext(AccessContext);

    const trialDaysRemaining = calculateTrialDaysRemaining(instanceStatus);

    if (
        instanceStatus.state === InstanceState.TRIAL &&
        typeof trialDaysRemaining === 'number' &&
        trialDaysRemaining <= 0
    ) {
        return (
            <StyledWarningBar data-testid={INSTANCE_STATUS_BAR_ID}>
                <StyledWarningIcon />
                <Typography
                    sx={theme => ({
                        fontSize: theme.fontSizes.smallBody,
                    })}
                >
                    <strong>Warning!</strong> Your free {instanceStatus.plan}{' '}
                    trial has expired. <strong>Upgrade trial</strong> otherwise
                    your <strong>account will be deleted.</strong>
                </Typography>
                <ConditionallyRender
                    condition={hasAccess(ADMIN)}
                    show={<UpgradeButton />}
                />
            </StyledWarningBar>
        );
    }

    if (
        instanceStatus.state === InstanceState.TRIAL &&
        typeof trialDaysRemaining === 'number' &&
        trialDaysRemaining <= 10
    ) {
        return (
            <StyledInfoBar data-testid={INSTANCE_STATUS_BAR_ID}>
                <StyledInfoIcon />
                <Typography
                    sx={theme => ({
                        fontSize: theme.fontSizes.smallBody,
                    })}
                >
                    <strong>Heads up!</strong> You have{' '}
                    <strong>{trialDaysRemaining} days</strong> left of your free{' '}
                    {instanceStatus.plan} trial.
                </Typography>
                <ConditionallyRender
                    condition={hasAccess(ADMIN)}
                    show={<UpgradeButton />}
                />
            </StyledInfoBar>
        );
    }

    return null;
};

const UpgradeButton = () => {
    const navigate = useNavigate();

    return (
        <StyledButton
            onClick={() => navigate('/admin/billing')}
            variant="outlined"
        >
            Upgrade trial
        </StyledButton>
    );
};

const StyledWarningBar = styled('aside')(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
    borderBottom: '1px solid',
    borderColor: theme.palette.warning.border,
    background: theme.palette.warning.light,
    color: theme.palette.warning.dark,
}));

const StyledInfoBar = styled('aside')(({ theme }) => ({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    gap: theme.spacing(1),
    borderBottom: '1px solid',
    borderColor: theme.palette.info.border,
    background: theme.palette.info.light,
    color: theme.palette.info.dark,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    minWidth: '8rem',
    marginLeft: theme.spacing(2),
}));

const StyledWarningIcon = styled(WarningAmber)(({ theme }) => ({
    color: theme.palette.warning.main,
}));

const StyledInfoIcon = styled(InfoOutlined)(({ theme }) => ({
    color: theme.palette.info.main,
}));
