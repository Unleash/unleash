import { useStyles } from './DisabledIndicator.styles';
import classnames from 'classnames';
interface IDisabledIndicator {
    className?: string;
}

const DisabledIndicator = ({ className }: IDisabledIndicator) => {
    const styles = useStyles();
    return (
        <span className={classnames(styles.indicator, className)}>
            disabled
        </span>
    );
};

export default DisabledIndicator;
