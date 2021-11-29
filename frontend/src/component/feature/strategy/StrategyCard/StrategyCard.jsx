import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardContent } from '@material-ui/core';

import { useStyles } from './StrategyCard.styles';
import StrategyCardContent from './StrategyCardContent/StrategyCardContent';
import StrategyCardHeader from './StrategyCardHeader/StrategyCardHeader';
import { getHumanReadableStrategyName } from '../../../../utils/strategy-names';

const StrategyCard = ({
    strategy,
    strategyDefinition,
    connectDragPreview,
    connectDragSource,
    removeStrategy,
    disableDelete,
    editStrategy,
    connectDropTarget,
}) => {
    const styles = useStyles();

    return connectDragPreview(
        connectDropTarget(
            <span style={{ alignItems: 'stretch' }}>
                <Card className={styles.strategyCard}>
                    <StrategyCardHeader
                        name={getHumanReadableStrategyName(strategy.name)}
                        connectDragSource={connectDragSource}
                        removeStrategy={removeStrategy}
                        editStrategy={editStrategy}
                        disableDelete={disableDelete}
                    />
                    <CardContent>
                        <StrategyCardContent
                            strategy={strategy}
                            strategyDefinition={strategyDefinition}
                        />
                    </CardContent>
                </Card>
            </span>
        )
    );
};

StrategyCard.propTypes = {
    strategy: PropTypes.object.isRequired,
    strategyDefinition: PropTypes.object.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    removeStrategy: PropTypes.func.isRequired,
    editStrategy: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
};

export default StrategyCard;
