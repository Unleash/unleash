import { Chip } from '@mui/material';
import { useStyles } from './StatusChip.styles';

interface IStatusChip {
    stale: boolean;
    showActive?: boolean;
}

const StatusChip = ({ stale, showActive = true }: IStatusChip) => {
    const { classes: styles } = useStyles();

    if (!stale && !showActive) {
        return null;
    }

    const title = stale
        ? 'Feature toggle is deprecated.'
        : 'Feature toggle is active.';
    const value = stale ? 'Stale' : 'Active';

    return (
        <div data-loading style={{ marginLeft: '8px' }}>
            <Chip
                color="primary"
                variant="outlined"
                className={styles.chip}
                title={title}
                label={value}
            />
        </div>
    );
};

export default StatusChip;
