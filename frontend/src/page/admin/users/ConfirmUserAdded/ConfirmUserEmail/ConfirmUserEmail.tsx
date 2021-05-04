import { Typography } from '@material-ui/core';
import Dialogue from '../../../../../component/common/Dialogue';

import { ReactComponent as EmailIcon } from '../../../../../assets/icons/email.svg';
import { useStyles } from './ConfirmUserEmail.styles';

interface IConfirmUserEmailProps {
    open: boolean;
    closeConfirm: () => void;
}

const ConfirmUserEmail = ({ open, closeConfirm }: IConfirmUserEmailProps) => {
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
        </Dialogue>
    );
};

export default ConfirmUserEmail;
