import { IConstraint } from '../../../../../../interfaces/strategy';
import { useStyles } from './FeatureStrategyExecutionConstraint.styles';

interface IFeatureStrategyExecutionConstraintProps {
    constraint: IConstraint;
}

const FeatureStrategyExecutionConstraint = ({
    constraint,
}: IFeatureStrategyExecutionConstraintProps) => {
    const translateOperator = (operator: string) => {
        if (operator === 'IN') {
            return 'IS';
        }
        return 'IS NOT';
    };

    const styles = useStyles();
    return (
        <div className={styles.constraint}>
            <p className={styles.constraintName}>{constraint.contextName}</p>
            <p className={styles.constraintOperator}>
                {translateOperator(constraint.operator)}
            </p>
            <p className={styles.constraintValues}>
                {constraint.values.join(', ')}
            </p>
        </div>
    );
};

export default FeatureStrategyExecutionConstraint;
