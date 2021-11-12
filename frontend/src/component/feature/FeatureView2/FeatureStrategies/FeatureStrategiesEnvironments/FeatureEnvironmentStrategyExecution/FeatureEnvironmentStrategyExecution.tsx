import { Fragment } from 'react';
import { IFeatureStrategy } from '../../../../../../interfaces/strategy';
import { useStyles } from './FeatureEnvironmentStrategyExecution.styles';
import FeatureEnvironmentStrategyExecutionSeparator from './FeatureEnvironmentStrategyExecutionSeparator/FeatureEnvironmentStrategyExecutionSeparator';
import FeatureEnvironmentStrategyExecutionWrapper from './FeatureEnvironmentStrategyExecutionWrapper/FeatureEnvironmentStrategyExecutionWrapper';

interface IFeatureEnvironmentStrategyExecutionProps {
    strategies: IFeatureStrategy[];
}
const FeatureEnvironmentStrategyExecution = ({
    strategies,
    env,
}: IFeatureEnvironmentStrategyExecutionProps) => {
    const styles = useStyles();

    const renderStrategies = () => {
        return strategies.map((strategy, index) => {
            if (index !== strategies.length - 1) {
                return (
                    <Fragment key={strategy.id}>
                        <FeatureEnvironmentStrategyExecutionWrapper
                            strategyId={strategy.id}
                        />
                        <FeatureEnvironmentStrategyExecutionSeparator />
                    </Fragment>
                );
            }
            return (
                <FeatureEnvironmentStrategyExecutionWrapper
                    strategyId={strategy.id}
                    key={strategy.id}
                />
            );
        });
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.header}>
                Visual overview of your strategy configuration
            </h3>
            {renderStrategies()}
        </div>
    );
};

export default FeatureEnvironmentStrategyExecution;
