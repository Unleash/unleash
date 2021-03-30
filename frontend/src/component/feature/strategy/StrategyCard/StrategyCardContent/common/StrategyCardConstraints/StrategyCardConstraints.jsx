import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import React from 'react';

import { useStyles } from './StrategyCardConstraints.styles.js';
import { useCommonStyles } from '../../../../../../../common.styles.js';

const StrategyCardConstraints = ({ constraints }) => {
    const styles = useStyles();
    const commonStyles = useCommonStyles();

    const renderConstraintValues = constraint =>
        constraint.values.map(value => (
            <Typography variant="body2" key={value} className={styles.constraintValue}>
                {value}
            </Typography>
        ));

    const renderConstraints = () =>
        constraints.map((constraint, i) => (
            <div key={`${constraint.contextName}-${i}`} className={styles.constraintContainer}>
                <div className={styles.constraintDisplayContainer}>
                    <Typography variant="body2" className={styles.label}>
                        context
                    </Typography>
                    <Typography variant="body2">{constraint.contextName}</Typography>
                </div>
                <div className={styles.constraintDisplayContainer}>
                    <Typography variant="body2" className={styles.label}>
                        operator
                    </Typography>
                    <Typography variant="body2">{constraint.operator}</Typography>
                </div>

                <div className={classnames(commonStyles.flexColumn, styles.constraintValuesContainer)}>
                    <Typography variant="body2" className={styles.label}>
                        values
                    </Typography>
                    <div className={classnames(commonStyles.flexRow, commonStyles.flexWrap)}>
                        {renderConstraintValues(constraint)}
                    </div>
                </div>
            </div>
        ));

    return (
        <>
            <Typography className={styles.title} variant="subtitle1">
                Constraints
            </Typography>
            {renderConstraints()}
        </>
    );
};

StrategyCardConstraints.propTypes = {
    constraints: PropTypes.array,
};

export default StrategyCardConstraints;
