import { Check } from '@material-ui/icons';
import { useStyles } from './CheckMarkBadge.styles';

const CheckMarkBadge = () => {
    const styles = useStyles();
    return (
        <div className={styles.badge}>
            <Check className={styles.check} />
        </div>
    );
};

export default CheckMarkBadge;
