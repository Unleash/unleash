import { Check, Close } from '@material-ui/icons';
import { useStyles } from './CheckMarkBadge.styles';
import classnames from 'classnames';

interface ICheckMarkBadgeProps {
    className: string;
    type?: string;
}

const CheckMarkBadge = ({ type, className }: ICheckMarkBadgeProps) => {
    const styles = useStyles();
    return (
        <div className={classnames(styles.badge, className)}>
            {type === 'error' ? (
                <Close className={styles.check} />
            ) : (
                <Check className={styles.check} />
            )}
        </div>
    );
};

export default CheckMarkBadge;
