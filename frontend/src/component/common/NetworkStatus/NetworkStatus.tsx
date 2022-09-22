import { styled, Button, Typography } from '@mui/material';
import { IInstanceStatus } from 'interfaces/instance';
import { INSTANCE_STATUS_BAR_ID } from 'utils/testIds';
import { WarningAmber } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';

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

const StyledButton = styled(Button)(({ theme }) => ({
    whiteSpace: 'nowrap',
    minWidth: '8rem',
    marginLeft: theme.spacing(2),
}));

const StyledWarningIcon = styled(WarningAmber)(({ theme }) => ({
    color: theme.palette.warning.main,
}));

const isMisbehaving = (instanceStatus: IInstanceStatus) => {
    // TODO: Implement.
    return true;
};

interface IInstanceStatusBarProps {
    instanceStatus: IInstanceStatus;
}

export const NetworkStatus = () => {
    const { instanceStatus } = useInstanceStatus();

    if (instanceStatus && isMisbehaving(instanceStatus)) {
        return <StatusBarNetworkWarning instanceStatus={instanceStatus} />;
    }

    return null;
};

const StatusBarNetworkWarning = ({
    instanceStatus,
}: IInstanceStatusBarProps) => {
    return (
        <StyledWarningBar data-testid={INSTANCE_STATUS_BAR_ID}>
            <StyledWarningIcon />
            <Typography sx={theme => ({ fontSize: theme.fontSizes.smallBody })}>
                <strong>Heads up!</strong> It seems like one of your client
                instances might be misbehaving.
            </Typography>
            <NetworkLink />
        </StyledWarningBar>
    );
};

const NetworkLink = () => {
    const { hasAccess } = useContext(AccessContext);
    const navigate = useNavigate();

    if (!hasAccess(ADMIN)) {
        return null;
    }

    return (
        <StyledButton
            onClick={() => navigate('/admin/network')}
            variant="outlined"
        >
            View Network
        </StyledButton>
    );
};
