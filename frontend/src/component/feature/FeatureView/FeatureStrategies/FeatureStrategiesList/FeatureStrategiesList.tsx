import useStrategies from '../../../../../hooks/api/getters/useStrategies/useStrategies';
import { IStrategy } from '../../../../../interfaces/strategy';
import FeatureStrategyCard from './FeatureStrategyCard/FeatureStrategyCard';
import { useStyles } from './FeatureStrategiesList.styles';
import { useContext } from 'react';
import FeatureStrategiesUIContext from '../../../../../contexts/FeatureStrategiesUIContext';
import { Button, useMediaQuery } from '@material-ui/core';
import ConditionallyRender from '../../../../common/ConditionallyRender';

const FeatureStrategiesList = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    // @ts-expect-error
    const { expandedSidebar, setExpandedSidebar } = useContext(
        FeatureStrategiesUIContext
    );

    const styles = useStyles();

    const { strategies } = useStrategies();

    const renderStrategies = () => {
        return strategies
            .filter((strategy: IStrategy) => !strategy.deprecated)
            .map((strategy: IStrategy, index: number) => (
                <FeatureStrategyCard
                    key={strategy.name}
                    configureNewStrategy={!expandedSidebar}
                    name={strategy.name}
                    description={strategy.description}
                    index={index}
                />
            ));
    };

    const toggleSidebar = () => {
        // @ts-expect-error
        setExpandedSidebar(prev => !prev);
    };

    return (
        <ConditionallyRender
            condition={expandedSidebar}
            show={
                <section className={styles.sidebar}>
                    <ConditionallyRender
                        condition={smallScreen && expandedSidebar}
                        show={
                            <div className={styles.mobileNavContainer}>
                                <p>Select strategy</p>
                                <Button onClick={toggleSidebar}>Back</Button>
                            </div>
                        }
                    />

                    {renderStrategies()}
                </section>
            }
        />
    );
};

export default FeatureStrategiesList;
