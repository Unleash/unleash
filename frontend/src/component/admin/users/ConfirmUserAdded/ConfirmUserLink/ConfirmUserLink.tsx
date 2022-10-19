import { Typography } from '@mui/material';
import { Alert } from '@mui/material';
import { useThemeStyles } from 'themes/themeStyles';
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
    const { classes: themeStyles } = useThemeStyles();
    return (
        <Dialogue
            open={open}
            onClick={closeConfirm}
            primaryButtonText="Close"
            title="Team member added"
        >
            <div className={themeStyles.contentSpacingYLarge}>
                <Typography variant="body1">
                    A new team member has been added. Please provide them with
                    the following link to get started:
                </Typography>
                <LinkField inviteLink={inviteLink} />

                <Typography variant="body1">
                    Copy the link and send it to the user. This will allow them
                    to set up their password and get started with their Unleash
                    account.
                </Typography>
                <Alert severity="info">
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
            </div>
        </Dialogue>
    );
};

export default ConfirmUserLink;
