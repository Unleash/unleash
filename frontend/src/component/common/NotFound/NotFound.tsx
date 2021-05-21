import { Button, Typography } from '@material-ui/core';
import { useHistory } from 'react-router';

import { ReactComponent as LogoIcon } from '../../../assets/icons/logo_wbg.svg';

import { useStyles } from './NotFound.styles';

const NotFound = () => {
    const history = useHistory();
    const styles = useStyles();

    const onClickHome = () => {
        history.push('/');
    };

    const onClickBack = () => {
        history.goBack();
    };

    return (
        <div className={styles.container}>
            <div>
                <LogoIcon className={styles.logo} />
                <div className={styles.content}>
                    <Typography variant="h1" style={{ fontSize: '2rem' }}>
                        Ooops. That's a page we haven't toggled on yet.
                    </Typography>
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onClickBack}
                    >
                        Go back
                    </Button>
                    <Button onClick={onClickHome} className={styles.homeButton}>
                        Go home
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
