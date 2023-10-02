import { Alert, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IAdminCount } from 'hooks/api/getters/useAdminCount/useAdminCount';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';

interface IPasswordAuthDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onClick: () => void;
    adminCount: IAdminCount;
    tokens: IApiToken[];
}

export const PasswordAuthDialog = ({
    open,
    setOpen,
    onClick,
    adminCount,
    tokens,
}: IPasswordAuthDialogProps) => (
    <Dialogue
        open={open}
        onClose={() => {
            setOpen(false);
        }}
        onClick={onClick}
        title="Disable password based login?"
        primaryButtonText="Disable password based login"
        secondaryButtonText="Cancel"
    >
        <Alert severity="warning">
            <strong>Warning!</strong> Disabling password based login may lock
            you out of the system permanently if you do not have any alternative
            admin credentials (such as an admin SSO account or admin API token)
            secured beforehand.
            <br />
            <br />
            <strong>Password based administrators: </strong>{' '}
            {adminCount?.password}
            <br />
            <strong>Other administrators: </strong> {adminCount?.noPassword}
            <br />
            <strong>Admin service accounts: </strong> {adminCount?.service}
            <br />
            <strong>Admin API tokens: </strong>{' '}
            {tokens.filter(({ type }) => type === 'admin').length}
        </Alert>
        <Typography sx={{ mt: 3 }}>
            You are about to disable password based login. Are you sure you want
            to proceed?
        </Typography>
    </Dialogue>
);
