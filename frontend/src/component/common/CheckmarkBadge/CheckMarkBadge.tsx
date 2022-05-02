import { Check, Close } from '@mui/icons-material';
import { useStyles } from './CheckMarkBadge.styles';
import classnames from 'classnames';

interface ICheckMarkBadgeProps {
    className: string;
    type?: string;
}

const CheckMarkBadge = ({ type, className }: ICheckMarkBadgeProps) => {
    const { classes: styles } = useStyles();
    return (
        <div className={classnames(styles.badge, className)}>
            {type === 'error' ? (
                <Close className={styles.check} titleAccess="Error" />
            ) : (
                <Check className={styles.check} />
            )}
        </div>
    );
};

export default CheckMarkBadge;
