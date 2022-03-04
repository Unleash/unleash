import { useContext } from 'react';
import FeatureStrategiesUIContext from '../../../../../../contexts/FeatureStrategiesUIContext';
import EnvironmentIcon from '../../../../../common/EnvironmentIcon/EnvironmentIcon';
import StringTruncator from '../../../../../common/StringTruncator/StringTruncator';
import { useStyles } from './FeatureStrategiesCreateHeader.styles';

const FeatureStrategiesCreateHeader = () => {
    const styles = useStyles();
    // @ts-expect-error
    const { expandedSidebar, configureNewStrategy, activeEnvironment } =
        useContext(FeatureStrategiesUIContext);

    if (!expandedSidebar && !configureNewStrategy) return null;

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <EnvironmentIcon enabled={activeEnvironment?.enabled} />
                Configuring strategy for&nbsp;
                <StringTruncator
                    text={activeEnvironment?.name}
                    maxWidth={'200'}
                />
            </div>
        </div>
    );
};

export default FeatureStrategiesCreateHeader;
