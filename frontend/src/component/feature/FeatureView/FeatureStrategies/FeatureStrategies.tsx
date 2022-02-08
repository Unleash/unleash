import { Paper } from '@material-ui/core';
import FeatureStrategiesList from './FeatureStrategiesList/FeatureStrategiesList';
import { useStyles } from './FeatureStrategies.styles';
import FeatureStrategiesUIProvider from './FeatureStrategiesUIProvider';
import FeatureStrategiesEnvironments from './FeatureStrategiesEnvironments/FeatureStrategiesEnvironments';
import FeatureStrategiesCreateHeader from './FeatureStrategiesEnvironments/FeatureStrategiesCreateHeader/FeatureStrategiesCreateHeader';

const FeatureStrategies = () => {
    const styles = useStyles();
    return (
        <Paper className={styles.paperContainer}>
            <FeatureStrategiesUIProvider>
                <FeatureStrategiesCreateHeader />
                <div className={styles.container}>
                    <FeatureStrategiesList />
                    <FeatureStrategiesEnvironments />
                </div>
            </FeatureStrategiesUIProvider>
        </Paper>
    );
};

export default FeatureStrategies;
