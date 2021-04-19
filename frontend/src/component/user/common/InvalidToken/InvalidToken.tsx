import { Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useCommonStyles } from '../../../../common.styles';

const InvalidToken = () => {
    const commonStyles = useCommonStyles();
    return (
        <div className={commonStyles.contentSpacingY}>
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
            >
                Reset password
            </Button>
        </div>
    );
};

export default InvalidToken;
