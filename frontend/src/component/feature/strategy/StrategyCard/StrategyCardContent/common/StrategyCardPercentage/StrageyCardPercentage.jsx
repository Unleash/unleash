import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './StrategyCardPercentage.styles.js';

const StrategyCardPercentage = ({ percentage }) => {
    const styles = useStyles();
    return (
        <div className={styles.percentageContainer}>
            <Typography className={styles.title} variant="body1">
                Rolled out to
            </Typography>
            <Typography variant="body1" className={styles.percentage}>
                {percentage || 0}%
            </Typography>
        </div>
    );
};

StrategyCardPercentage.propTypes = {
    percentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default StrategyCardPercentage;
