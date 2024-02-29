import { Alert, styled, Typography } from '@mui/material';
import { UserToken } from 'component/admin/apiToken/ConfirmToken/UserToken/UserToken';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

interface IIncomingWebhooksTokensDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    token?: string;
}

export const IncomingWebhooksTokensDialog = ({
    open,
    setOpen,
    token,
}: IIncomingWebhooksTokensDialogProps) => (
    <Dialogue
        open={open}
        secondaryButtonText='Close'
        onClose={(_, muiCloseReason?: string) => {
            if (!muiCloseReason) {
                setOpen(false);
            }
        }}
        title='Incoming webhook token created'
    >
        <StyledAlert severity='info'>
            Make sure to copy your incoming webhook token now. You won't be able
            to see it again!
        </StyledAlert>
        <Typography variant='body1'>Your token:</Typography>
        <UserToken token={token || ''} />
    </Dialogue>
);
