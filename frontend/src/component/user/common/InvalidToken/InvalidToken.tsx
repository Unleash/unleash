import { VFC } from 'react';
import { Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { INVALID_TOKEN_BUTTON } from 'utils/testIds';
import { useThemeStyles } from 'themes/themeStyles';
import classnames from 'classnames';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useAuthDetails } from 'hooks/api/getters/useAuth/useAuthDetails';

const InvalidToken: VFC = () => {
    const { authDetails } = useAuthDetails();
    const { classes: themeStyles } = useThemeStyles();
    const passwordDisabled = authDetails?.defaultHidden === true;

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
            <ConditionallyRender
                condition={passwordDisabled}
                show={
                    <>
                        <Typography variant="subtitle1">
                            Your instance does not support password
                            authentication. Use correct work email to access
                            your account.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            component={Link}
                            to="/login"
                        >
                            Login
                        </Button>
                    </>
                }
                elseShow={
                    <>
                        <Typography variant="subtitle1">
                            Your token has either been used to reset your
                            password, or it has expired. Please request a new
                            reset password URL in order to reset your password.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            component={Link}
                            to="/forgotten-password"
                            data-testid={INVALID_TOKEN_BUTTON}
                        >
                            Reset password
                        </Button>
                    </>
                }
            />
        </div>
    );
};

export default InvalidToken;
