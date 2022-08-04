import { Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { ReactComponent as LogoIcon } from 'assets/icons/logoBg.svg';

import { useStyles } from './NotFound.styles';
import { GO_BACK } from 'constants/navigate';

const NotFound = () => {
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    const onClickHome = () => {
        navigate('/');
    };

    const onClickBack = () => {
        navigate(GO_BACK);
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
