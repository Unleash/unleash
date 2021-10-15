import useStrategies from '../../../../../hooks/api/getters/useStrategies/useStrategies';
import { IStrategy } from '../../../../../interfaces/strategy';
import FeatureStrategyCard from './FeatureStrategyCard/FeatureStrategyCard';
import { useStyles } from './FeatureStrategiesList.styles';
import { useContext } from 'react';
import FeatureStrategiesUIContext from '../../../../../contexts/FeatureStrategiesUIContext';
import classnames from 'classnames';
import { Button, IconButton, Tooltip, useMediaQuery } from '@material-ui/core';
import { DoubleArrow } from '@material-ui/icons';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import { UPDATE_FEATURE } from '../../../../AccessProvider/permissions';
import AccessContext from '../../../../../contexts/AccessContext';


const FeatureStrategiesList = () => {
    const smallScreen = useMediaQuery('(max-width:700px)');
    const { expandedSidebar, setExpandedSidebar } = useContext(
        FeatureStrategiesUIContext
    );
    const { hasAccess } = useContext(AccessContext);

    const styles = useStyles();

    const { strategies } = useStrategies();

    const DEFAULT_STRATEGY = 'default';

    const renderStrategies = () => {
        return strategies
            .filter(
                (strategy: IStrategy) =>
                    !strategy.deprecated && strategy.name !== DEFAULT_STRATEGY
            )
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
        setExpandedSidebar(prev => !prev);
    };

    const classes = classnames(styles.sidebar, {
        [styles.sidebarSmall]: !expandedSidebar,
    });

    const iconClasses = classnames(styles.icon, {
        [styles.expandedIcon]: expandedSidebar,
    });
    
    return (
        <section className={classes}>
            <ConditionallyRender
                condition={smallScreen && expandedSidebar}
                show={
                    <div className={styles.mobileNavContainer}>
                        <p>Select strategy</p>
                        <Button onClick={toggleSidebar}>Back</Button>
                    </div>
                }
            />
            <Tooltip title={hasAccess(UPDATE_FEATURE) ? 'Click to open.' : 'You don\'t have access to perform this operation'} arrow>
                <span className={styles.iconButtonWrapper}>
                    <IconButton
                        className={styles.iconButton}
                        onClick={toggleSidebar}
                        disabled={!hasAccess(UPDATE_FEATURE)}
                    >
                        <DoubleArrow className={iconClasses} />
                    </IconButton>
                </span>
            </Tooltip>
            {renderStrategies()}
        </section>
    );
};

export default FeatureStrategiesList;
