import classnames from 'classnames';
import { IConstraint } from '../../../interfaces/strategy';
import FeatureStrategiesSeparator from '../../feature/FeatureView2/FeatureStrategies/FeatureStrategiesEnvironments/FeatureStrategiesSeparator/FeatureStrategiesSeparator';
import StringTruncator from '../StringTruncator/StringTruncator';
import { useStyles } from './Constraint.styles';

interface IConstraintProps {
    constraint: IConstraint;
    className?: string;
}

const Constraint = ({ constraint, className, ...rest }: IConstraintProps) => {
    const styles = useStyles();

    const classes = classnames(styles.constraint, {
        [styles.column]: constraint.values.length > 2,
    });

    return (
        <div className={classes + ' ' + className} {...rest}>
            <StringTruncator text={constraint.contextName} maxWidth="125" />
            <FeatureStrategiesSeparator
                text={constraint.operator}
                maxWidth="none"
            />
            <span className={styles.values}>
                {constraint.values.join(', ')}
            </span>
        </div>
    );
};

export default Constraint;
