import { useEffect } from 'react';
import classnames from 'classnames';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import AuthenticationContainer from '../authentication-container';
import ConditionallyRender from '../../common/ConditionallyRender';

import { ReactComponent as UnleashLogo } from '../../../icons/unleash-logo-inverted.svg';
import { ReactComponent as SwitchesSVG } from '../../../icons/switches.svg';
import { useStyles } from './Login.styles';

const Login = ({ history, loadInitialData, isUnauthorized, authDetails }) => {
    const theme = useTheme();
    const styles = useStyles();
    const smallScreen = useMediaQuery(theme.breakpoints.up('md'));

    useEffect(() => {
        if (isUnauthorized()) {
            loadInitialData();
        } else {
            history.push('features');
        }
        /* eslint-disable-next-line */
    }, [authDetails]);

    return (
        <div className={styles.loginContainer}>
            <div className={classnames(styles.container)}>
                <div
                    className={classnames(
                        styles.contentContainer,
                        styles.gradient
                    )}
                >
                    <h1 className={styles.title}>
                        <UnleashLogo className={styles.logo} /> Unleash
                    </h1>
                    <Typography variant="body1" className={styles.subTitle}>
                        Committed to creating new ways of developing
                    </Typography>
                    <ConditionallyRender
                        condition={smallScreen}
                        show={
                            <div className={styles.imageContainer}>
                                <SwitchesSVG />
                            </div>
                        }
                    />
                </div>
                <div className={styles.contentContainer}>
                    <h2 className={styles.title}>Login</h2>
                    <div className={styles.loginFormContainer}>
                        <AuthenticationContainer history={history} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
