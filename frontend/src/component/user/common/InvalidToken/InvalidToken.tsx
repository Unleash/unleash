import { Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { INVALID_TOKEN_BUTTON } from 'utils/testIds';
import { useCommonStyles } from 'themes/commonStyles';
import classnames from 'classnames';

const InvalidToken = () => {
    const commonStyles = useCommonStyles();
    return (
        <div
            className={classnames(
                commonStyles.contentSpacingY,
                commonStyles.flexColumn,
                commonStyles.itemsCenter
            )}
        >
            <Typography variant="h2" className={commonStyles.title}>
                Invalid token
            </Typography>
            <Typography variant="subtitle1">
                Your token has either been used to reset your password, or it
                has expired. Please request a new reset password URL in order to
                reset your password.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to="forgotten-password"
                data-test={INVALID_TOKEN_BUTTON}
            >
                Reset password
            </Button>
        </div>
    );
};

export default InvalidToken;
