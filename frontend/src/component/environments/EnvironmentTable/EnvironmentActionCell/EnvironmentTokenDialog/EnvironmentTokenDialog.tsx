import { Typography } from '@mui/material';
import { UserToken } from 'component/admin/apiToken/ConfirmToken/UserToken/UserToken';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IApiToken } from 'hooks/api/getters/useApiTokens/useApiTokens';
import { Link } from 'react-router-dom';

interface IEnvironmentTokenDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    token?: IApiToken;
}

export const EnvironmentTokenDialog = ({
    open,
    setOpen,
    token,
}: IEnvironmentTokenDialogProps) => (
    <Dialogue
        open={open}
        secondaryButtonText="Close"
        onClose={(_, muiCloseReason?: string) => {
            if (!muiCloseReason) {
                setOpen(false);
            }
        }}
        title="New API token created"
    >
        <Typography variant="body1">
            Your new token has been created successfully.
        </Typography>
        <Typography variant="body1">
            You can also find it as "<strong>{token?.username}</strong>" in the{' '}
            <Link to="/admin/api">API access page</Link>.
        </Typography>
        <UserToken token={token?.secret || ''} />
    </Dialogue>
);
