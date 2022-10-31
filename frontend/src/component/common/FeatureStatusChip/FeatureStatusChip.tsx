import { Chip } from '@mui/material';
import { useStyles } from './FeatureStatusChip.styles';

interface IStatusChip {
    stale: boolean;
    showActive?: boolean;
}

export const FeatureStatusChip = ({ stale, showActive = true }: IStatusChip) => {
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

