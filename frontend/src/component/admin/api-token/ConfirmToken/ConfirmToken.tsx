import { Typography } from '@material-ui/core';
import { useCommonStyles } from '../../../../common.styles';
import Dialogue from '../../../common/Dialogue';
import UserToken from './UserToken/UserToken';

interface IConfirmUserLink {
    open: boolean;
    closeConfirm: () => void;
    token: string;
}

const ConfirmToken = ({
    open,
    closeConfirm,
    token,
}: IConfirmUserLink) => {
    const commonStyles = useCommonStyles();
    return (
        <Dialogue
            open={open}
            onClick={closeConfirm}
            primaryButtonText="Close"
            title="New token created"
        >
            <div className={commonStyles.contentSpacingYLarge}>
                <Typography variant="body1">
                    Your new token has been created successfully.
                </Typography>
                <UserToken token={token} />
            </div>
        </Dialogue>
    );
};

export default ConfirmToken;
