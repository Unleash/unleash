import { VFC } from 'react';
import { Box, Typography } from '@mui/material';
import { useStyles } from './FeatureStaleCell.styles';
import classnames from 'classnames';

interface IFeatureStaleCellProps {
    value?: boolean;
}

export const FeatureStaleCell: VFC<IFeatureStaleCellProps> = ({ value }) => {
    const { classes: styles } = useStyles();
    return (
        <Box sx={{ py: 1.5, px: 2 }}>
            <Typography
                component="span"
                className={classnames(styles.status, value && styles.stale)}
                data-loading
            >
                {value ? 'Stale' : 'Active'}
            </Typography>
        </Box>
    );
};
