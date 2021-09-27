import useStrategies from '../../../../../hooks/api/getters/useStrategies/useStrategies';
import { IStrategy } from '../../../../../interfaces/strategy';
import FeatureStrategyCard from './FeatureStrategyCard/FeatureStrategyCard';
import { useStyles } from './FeatureStrategiesList.styles';
import { useContext } from 'react';
import FeatureStrategiesUIContext from '../../../../../contexts/FeatureStrategiesUIContext';
import classnames from 'classnames';

const FeatureStrategiesList = () => {
    const { expandedSidebar } = useContext(FeatureStrategiesUIContext);
    const styles = useStyles();

    const { strategies } = useStrategies();

    const renderStrategies = () => {
        return strategies
            .filter((strategy: IStrategy) => !strategy.deprecated)
            .map((strategy: IStrategy) => (
                <FeatureStrategyCard
                    key={strategy.name}
                    configureNewStrategy={!expandedSidebar}
                    name={strategy.name}
                    description={strategy.description}
                />
            ));
    };

    const classes = classnames(styles.sidebar, {
        [styles.sidebarSmall]: !expandedSidebar,
    });

    return <section className={classes}>{renderStrategies()}</section>;
};

export default FeatureStrategiesList;
