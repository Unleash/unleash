import { Paper } from '@material-ui/core';
import FeatureStrategiesList from './FeatureStrategiesList/FeatureStrategiesList';
import { useStyles } from './FeatureStrategies.styles';
import FeatureStrategiesUIProvider from './FeatureStrategiesUIProvider';
import FeatureStrategiesEnvironments from './FeatureStrategiesEnvironments/FeatureStrategiesEnvironments';
import ConditionallyRender from '../../../common/ConditionallyRender';
import { UPDATE_FEATURE } from '../../../AccessProvider/permissions';
import { useContext } from 'react';
import AccessContext from '../../../../contexts/AccessContext';

const FeatureStrategies = () => {
    const { hasAccess } = useContext(AccessContext);

    const styles = useStyles();
    return (
        <Paper className={styles.container}>
            <FeatureStrategiesUIProvider>
                <ConditionallyRender
                    condition={hasAccess(UPDATE_FEATURE)}
                    show={<FeatureStrategiesList />}
                />

                <FeatureStrategiesEnvironments />
            </FeatureStrategiesUIProvider>
        </Paper>
    );
};

export default FeatureStrategies;
