import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import { useStyles } from './StrategyCardField.styles.js';

const StrategyCardField = ({ title, value }) => {
    const styles = useStyles();
    return (
        <div className={styles.fieldContainer}>
            <Typography variant="body1">{title}</Typography>
            <Typography className={styles.fieldValue} variant="body1">
                {value}
            </Typography>
        </div>
    );
};

StrategyCardField.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default StrategyCardField;
