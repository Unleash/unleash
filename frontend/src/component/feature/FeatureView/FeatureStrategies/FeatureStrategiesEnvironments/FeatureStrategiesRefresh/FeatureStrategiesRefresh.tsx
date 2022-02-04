import { Button } from '@material-ui/core';
import AnimateOnMount from '../../../../../common/AnimateOnMount/AnimateOnMount';
import { useStyles } from './FeatureStrategiesRefresh.styles';

interface IFeatureStrategiesRefreshProps {
    show: boolean;
    refresh: () => void;
    cancel: () => void;
}

const FeatureStrategiesRefresh = ({
    show,
    refresh,
    cancel,
}: IFeatureStrategiesRefreshProps) => {
    const styles = useStyles();

    return (
        <AnimateOnMount
            mounted={show}
            enter={styles.fadeInEnter}
            start={styles.fadeInStart}
            leave={styles.fadeInLeave}
        >
            <div className={styles.container}>
                <p className={styles.refreshHeader}>
                    NOTE: Updated configuration
                </p>
                <p className={styles.paragraph}>
                    There is new strategy configuration available. This might
                    mean that someone has updated the strategy configuration
                    while you were working. Would you like to refresh?
                </p>

                <div className={styles.buttonContainer}>
                    <Button
                        onClick={refresh}
                        variant="contained"
                        color="primary"
                        className={styles.mainBtn}
                    >
                        Refresh configuration
                    </Button>

                    <Button onClick={cancel}>Disregard</Button>
                </div>
            </div>
        </AnimateOnMount>
    );
};

export default FeatureStrategiesRefresh;
