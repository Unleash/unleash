import { useStyles } from './ConstraintAccordion.styles';
import { TrackChanges } from '@material-ui/icons';

export const ConstraintIcon = () => {
    const styles = useStyles();

    return (
        <div className={styles.constraintIconContainer}>
            <TrackChanges className={styles.constraintIcon} />
        </div>
    );
};
