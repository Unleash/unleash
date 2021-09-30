import {
    IConstraint,
    IFeatureStrategy,
    IParameter,
} from '../../../../../interfaces/strategy';
import FeatureStrategyExecution from '../FeatureStrategyExecution/FeatureStrategyExecution';
import { useStyles } from './FeatureStrategyCreateExecution.styles';

interface IFeatureStrategyCreateExecutionProps {
    parameters: IParameter;
    constraints: IConstraint[];
    configureNewStrategy: IFeatureStrategy;
}

const FeatureStrategyCreateExecution = ({
    parameters,
    constraints,
    configureNewStrategy,
}: IFeatureStrategyCreateExecutionProps) => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <h3 className={styles.header}>Execution plan</h3>
            <FeatureStrategyExecution
                parameters={parameters}
                constraints={constraints}
                strategy={configureNewStrategy}
            />
        </div>
    );
};

export default FeatureStrategyCreateExecution;
