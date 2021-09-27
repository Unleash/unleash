import { IConstraint, IParameter } from '../../../../../interfaces/strategy';
import FeatureStrategyExecution from '../FeatureStrategyExecution/FeatureStrategyExecution';
import { useStyles } from './FeatureStrategyCreateExecution.styles';

interface IFeatureStrategyCreateExecutionProps {
    parameters: IParameter;
    constraints: IConstraint[];
}

const FeatureStrategyCreateExecution = ({
    parameters,
    constraints,
}: IFeatureStrategyCreateExecutionProps) => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <h3 className={styles.header}>Execution plan</h3>
            <FeatureStrategyExecution
                parameters={parameters}
                constraints={constraints}
            />
        </div>
    );
};

export default FeatureStrategyCreateExecution;
