import React from 'react';

import { Typography } from '@material-ui/core';

import { useCommonStyles } from '../../../../../../common.styles';
import StrategyCardConstraints from '../common/StrategyCardConstraints/StrategyCardConstraints';

const StrategyCardContentDefault = ({ strategy }) => {
    const commonStyles = useCommonStyles();

    const { constraints } = strategy;

    return (
        <>
            <StrategyCardConstraints constraints={constraints} />
            <div className={commonStyles.divider} />
            <Typography className={commonStyles.textCenter}>
                The default strategy is on for all users.
            </Typography>
        </>
    );
};

export default StrategyCardContentDefault;
