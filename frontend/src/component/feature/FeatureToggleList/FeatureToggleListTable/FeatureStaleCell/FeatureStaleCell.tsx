import { VFC } from 'react';
import { Typography } from '@mui/material';
import { useStyles } from './FeatureStaleCell.styles';
import classnames from 'classnames';

interface IFeatureStaleCellProps {
    value?: boolean;
}

export const FeatureStaleCell: VFC<IFeatureStaleCellProps> = ({ value }) => {
    const { classes: styles } = useStyles();
    return (
        <Typography
            component="span"
            className={classnames(styles.status, value && styles.stale)}
            data-loading
        >
            {value ? 'Stale' : 'Active'}
        </Typography>
    );
};
