import { Paper } from '@material-ui/core';
import FeatureStrategiesList from './FeatureStrategiesList/FeatureStrategiesList';
import { useStyles } from './FeatureStrategies.styles';
import FeatureStrategiesUIProvider from './FeatureStrategiesUIProvider';
import FeatureStrategiesEnvironments from './FeatureStrategiesEnvironments/FeatureStrategiesEnvironments';

const FeatureStrategies = () => {
    const styles = useStyles();
    return (
        <Paper className={styles.container}>
            <FeatureStrategiesUIProvider>
                <FeatureStrategiesList />
                <FeatureStrategiesEnvironments />
            </FeatureStrategiesUIProvider>
        </Paper>
    );
};

export default FeatureStrategies;
