import React from 'react';

import { Typography } from '@material-ui/core';

import { useCommonStyles } from '../../../../../../common.styles';
import ConditionallyRender from '../../../../../common/ConditionallyRender';
import StrategyCardConstraints from '../common/StrategyCardConstraints/StrategyCardConstraints';

const StrategyCardContentDefault = ({ strategy }) => {
    const commonStyles = useCommonStyles();

    const { constraints } = strategy;

    return (
        <>
            <Typography className={commonStyles.textCenter}>
                The default strategy is either on or off for all users.
            </Typography>
            <ConditionallyRender
                condition={constraints && constraints.length > 0}
                show={
                    <>
                        <div className={commonStyles.divider} />
                        <StrategyCardConstraints constraints={constraints} />
                    </>
                }
            />
        </>
    );
};

export default StrategyCardContentDefault;
