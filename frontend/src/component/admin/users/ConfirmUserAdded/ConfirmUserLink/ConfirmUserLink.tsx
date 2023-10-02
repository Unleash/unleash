import { Typography } from '@mui/material';
import { Alert } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { LinkField } from '../../LinkField/LinkField';

interface IConfirmUserLink {
    open: boolean;
    closeConfirm: () => void;
    inviteLink: string;
}

const ConfirmUserLink = ({
    open,
    closeConfirm,
    inviteLink,
}: IConfirmUserLink) => {
    return (
        <Dialogue
            open={open}
            onClick={closeConfirm}
            primaryButtonText="Close"
            title="Team member added"
        >
            <Typography variant="body1" sx={{ mb: 2 }}>
                A new team member has been added.
            </Typography>
            <Typography variant="body1">
                Please provide them with the following link. This will allow
                them to set up their password and get started with their Unleash
                account.
            </Typography>
            <LinkField inviteLink={inviteLink} />
            <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                    Want to avoid this step in the future?{' '}
                    {/* TODO - ADD LINK HERE ONCE IT EXISTS*/}
                    <a
                        href="https://docs.getunleash.io/docs/deploy/email"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        If you configure an email server for Unleash
                    </a>{' '}
                    we'll automatically send informational getting started
                    emails to new users once you add them.
                </Typography>
            </Alert>
        </Dialogue>
    );
};

export default ConfirmUserLink;
