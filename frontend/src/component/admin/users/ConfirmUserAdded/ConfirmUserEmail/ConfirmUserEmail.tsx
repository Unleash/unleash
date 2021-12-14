import { Typography } from '@material-ui/core';
import Dialogue from '../../../../common/Dialogue';

import { ReactComponent as EmailIcon } from '../../../../../assets/icons/email.svg';
import { useStyles } from './ConfirmUserEmail.styles';
import UserInviteLink from '../ConfirmUserLink/UserInviteLink/UserInviteLink';

interface IConfirmUserEmailProps {
    open: boolean;
    closeConfirm: () => void;
    inviteLink: string;
}

const ConfirmUserEmail = ({
    open,
    closeConfirm,
    inviteLink,
}: IConfirmUserEmailProps) => {
    const styles = useStyles();
    return (
        <Dialogue
            open={open}
            title="Team member added"
            primaryButtonText="Close"
            onClick={closeConfirm}
        >
            <Typography>
                A new team member has been added. We’ve sent an email on your
                behalf to inform them of their new account and role. No further
                steps are required.
            </Typography>
            <div className={styles.iconContainer}>
                <EmailIcon className={styles.emailIcon} />
            </div>
            <Typography style={{ fontWeight: 'bold' }} variant="subtitle1">
                In a rush?
            </Typography>
            <Typography>
                You may also copy the invite link and send it to the user.
            </Typography>
            <UserInviteLink inviteLink={inviteLink} />
        </Dialogue>
    );
};

export default ConfirmUserEmail;
