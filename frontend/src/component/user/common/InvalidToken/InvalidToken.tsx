import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { INVALID_TOKEN_BUTTON } from 'utils/testIds';
import { useThemeStyles } from 'themes/themeStyles';
import classnames from 'classnames';

const InvalidToken = () => {
    const { classes: themeStyles } = useThemeStyles();
    return (
        <div
            className={classnames(
                themeStyles.contentSpacingY,
                themeStyles.flexColumn,
                themeStyles.itemsCenter
            )}
        >
            <Typography variant="h2" className={themeStyles.title}>
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
                data-testid={INVALID_TOKEN_BUTTON}
            >
                Reset password
            </Button>
        </div>
    );
};

export default InvalidToken;
