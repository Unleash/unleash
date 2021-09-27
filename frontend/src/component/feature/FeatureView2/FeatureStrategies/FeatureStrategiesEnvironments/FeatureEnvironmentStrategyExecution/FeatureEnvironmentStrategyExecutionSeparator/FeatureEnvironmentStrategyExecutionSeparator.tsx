import FeatureStrategiesSeparator from '../../FeatureStrategiesSeparator/FeatureStrategiesSeparator';
import { useStyles } from './FeatureEnvironmentStrategyExecutionSeparator.styles';

const FeatureEnvironmentStrategyExecutionSeparator = () => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <div className={styles.separatorBorder} />
            <div className={styles.textContainer}>
                <div className={styles.textPositioning}>
                    <FeatureStrategiesSeparator text="OR" />
                </div>
            </div>
        </div>
    );
};

export default FeatureEnvironmentStrategyExecutionSeparator;
