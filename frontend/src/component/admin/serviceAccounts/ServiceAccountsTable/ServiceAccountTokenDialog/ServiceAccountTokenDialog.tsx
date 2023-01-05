import { Alert, styled, Typography } from '@mui/material';
import { UserToken } from 'component/admin/apiToken/ConfirmToken/UserToken/UserToken';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { INewPersonalAPIToken } from 'interfaces/personalAPIToken';
import { FC } from 'react';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

interface IServiceAccountDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    token?: INewPersonalAPIToken;
}

export const ServiceAccountTokenDialog: FC<IServiceAccountDialogProps> = ({
    open,
    setOpen,
    token,
}) => (
    <Dialogue
        open={open}
        secondaryButtonText="Close"
        onClose={(_, muiCloseReason?: string) => {
            if (!muiCloseReason) {
                setOpen(false);
            }
        }}
        title="Service account token created"
    >
        <StyledAlert severity="info">
            Make sure to copy your service account API token now. You won't be
            able to see it again!
        </StyledAlert>
        <Typography variant="body1">Your token:</Typography>
        <UserToken token={token?.secret || ''} />
    </Dialogue>
);
