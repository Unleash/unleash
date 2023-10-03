import { Box, Typography } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

import { ReactComponent as EmailIcon } from 'assets/icons/email.svg';
import { LinkField } from '../LinkField';

interface IConfirmUserEmailProps {
    open: boolean;
    closeConfirm: () => void;
    inviteLink: string;
}

const ConfirmUserEmail = ({
    open,
    closeConfirm,
    inviteLink,
}: IConfirmUserEmailProps) => (
    <Dialogue
        open={open}
        title="Team member added"
        primaryButtonText="Close"
        onClick={closeConfirm}
    >
        <Typography>
            A new team member has been added. We’ve sent an email on your behalf
            to inform them of their new account and role. No further steps are
            required.
        </Typography>
        <Box sx={{ width: '100%', textAlign: 'center', px: 'auto', py: 4 }}>
            <EmailIcon />
        </Box>
        <Typography style={{ fontWeight: 'bold' }} variant="subtitle1">
            In a rush?
        </Typography>
        <Typography>
            You may also copy the invite link and send it to the user.
        </Typography>
        <LinkField inviteLink={inviteLink} />
    </Dialogue>
);

export default ConfirmUserEmail;
