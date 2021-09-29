import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import CheckMarkBadge from '../../../common/CheckmarkBadge/CheckMarkBadge';
import { useStyles } from './CreateEnvironmentSuccess.styles';
import CreateEnvironmentSuccessCard from './CreateEnvironmentSuccessCard/CreateEnvironmentSuccessCard';

export interface ICreateEnvironmentSuccessProps {
    name: string;
    type: string;
}

const CreateEnvironmentSuccess = ({
    name,
    type,
}: ICreateEnvironmentSuccessProps) => {
    const history = useHistory();
    const styles = useStyles();

    const navigateToEnvironmentList = () => {
        history.push('/environments');
    };

    return (
        <div className={styles.container}>
            <CheckMarkBadge />
            <h2 className={styles.subheader}>Environment created</h2>
            <CreateEnvironmentSuccessCard
                name={name}
                type={type}
            />
            <h2 className={styles.subheader}>Next steps</h2>
            <div className={styles.nextSteps}>
                <div className={styles.step}>
                    <div>
                        <div className={styles.stepBadge}>1</div>
                        <h3 className={styles.subheader}>
                            Update SDK version and provide the environment id to
                            the SDK
                        </h3>
                        <p className={styles.stepParagraph}>
                            By providing the environment id in the SDK the SDK
                            will only retrieve activation strategies for
                            specified environment
                        </p>
                        <a
                            href="https://docs.getunleash.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            Learn more
                        </a>
                    </div>
                </div>
                <div className={styles.step}>
                    <div>
                        <div className={styles.stepBadge}>2</div>
                        <h3 className={styles.subheader}>
                            Add environment specific activation strategies
                        </h3>

                        <p className={styles.stepParagraph}>
                            You can now select this environment when you are
                            adding new activation strategies on feature toggles.
                        </p>
                        <a
                            href="https://docs.getunleash.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            Learn more
                        </a>
                    </div>
                </div>
            </div>

            <Button
                variant="contained"
                color="primary"
                className={styles.button}
                onClick={navigateToEnvironmentList}
            >
                Got it!
            </Button>
        </div>
    );
};

export default CreateEnvironmentSuccess;
