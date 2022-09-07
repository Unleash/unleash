import { useStyles } from 'component/splash/SplashPageOperators/SplashPageOperators.styles';
import { Link, useNavigate } from 'react-router-dom';
import { Button, IconButton } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { OperatorUpgradeAlert } from 'component/common/OperatorUpgradeAlert/OperatorUpgradeAlert';

export const SplashPageOperators = () => {
    const navigate = useNavigate();
    const { classes: styles } = useStyles();

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <header className={styles.header}>
                    <h1 className={styles.title}>New strategy operators</h1>
                    <IconButton
                        className={styles.close}
                        onClick={() => navigate('/')}
                        size="large"
                    >
                        <CloseOutlined titleAccess="Close" />
                    </IconButton>
                    <p className={styles.ingress}>
                        We've added some new feature strategy constraint
                        operators. Fine-tune your feature targeting like never
                        before.
                    </p>
                </header>
                <div className={styles.body}>
                    <p>For example:</p>
                    <ul className={styles.list}>
                        <li>
                            <span>Toggle features at dates: </span>
                            <span>
                                <strong>DATE_BEFORE</strong>{' '}
                                <strong>DATE_AFTER</strong>
                            </span>
                        </li>
                        <li>
                            <span>Toggle features for versions: </span>
                            <span>
                                <strong>SEMVER_EQ</strong>{' '}
                                <strong>SEMVER_GT</strong>{' '}
                                <strong>SEMVER_LT</strong>
                            </span>
                        </li>
                        <li>
                            <span>Toggle features for strings: </span>
                            <span>
                                <strong>STR_CONTAINS</strong>{' '}
                                <strong>STR_ENDS_WITH</strong>{' '}
                                <strong>STR_STARTS_WITH</strong>
                            </span>
                        </li>
                        <li>
                            <span>Toggle features for numbers: </span>
                            <span>
                                <strong>NUM_GT</strong> <strong>NUM_GTE</strong>{' '}
                                <strong>NUM_LT</strong> <strong>NUM_LTE</strong>
                            </span>
                        </li>
                    </ul>
                </div>
                <footer className={styles.footer}>
                    <p>
                        <a
                            href="https://docs.getunleash.io/advanced/strategy_constraints#numeric-operators"
                            target="_blank"
                            rel="noreferrer"
                            className={styles.link}
                        >
                            Read all about operators in our in-depth{' '}
                            <strong>docs</strong>
                        </a>
                        .
                    </p>
                    <p>
                        <Button
                            className={styles.button}
                            variant="contained"
                            component={Link}
                            to="/"
                        >
                            Fine, whatever, I have work to do!
                        </Button>
                    </p>
                </footer>
            </div>
            <OperatorUpgradeAlert />
        </section>
    );
};
