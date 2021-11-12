import { useContext } from 'react';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import EnvironmentIcon from '../../../../../common/EnvironmentIcon/EnvironmentIcon';
import { useStyles } from './FeatureStrategiesCreateHeader.styles';

const FeatureStrategiesCreateHeader = () => {
    const styles = useStyles();
    const { expandedSidebar, configureNewStrategy, activeEnvironment } =
        useContext(FeatureStrategiesUIContext);

    if (!expandedSidebar && !configureNewStrategy) return null;

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <EnvironmentIcon enabled={activeEnvironment?.enabled} />{' '}
                Configuring strategy for {activeEnvironment?.name}
            </div>
        </div>
    );
};

export default FeatureStrategiesCreateHeader;
