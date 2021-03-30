import React from 'react';

import { Typography } from '@material-ui/core';

import { useCommonStyles } from '../../../../../../common.styles';

const StrategyCardContentDefault = () => {
    const commonStyles = useCommonStyles();

    return (
        <Typography className={commonStyles.textCenter}>
            The default strategy is either on or off for all users.
        </Typography>
    );
};

export default StrategyCardContentDefault;
