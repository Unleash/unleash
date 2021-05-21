import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useStyles } from './SecondaryLoginActions.styles';

const SecondaryLoginActions = () => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <Link to="/forgotten-password" className={styles.link}>
                <Typography variant="body2" className={styles.text}>
                    Forgot password?
                </Typography>
            </Link>
            <Typography variant="body2">
                Don't have an account?{' '}
                <a
                    href="https://www.getunleash.io/plans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                >
                    Sign up
                </a>
            </Typography>
        </div>
    );
};

export default SecondaryLoginActions;
