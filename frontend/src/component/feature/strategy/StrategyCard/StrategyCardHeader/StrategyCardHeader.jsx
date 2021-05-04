import React from 'react';
import PropTypes from 'prop-types';

import {
    CardHeader,
    Typography,
    IconButton,
    Icon,
    Tooltip,
} from '@material-ui/core';

import { useStyles } from './StrategyCardHeader.styles.js';
import { ReactComponent as ReorderIcon } from '../../../../../assets/icons/reorder.svg';

const StrategyCardHeader = ({
    name,
    connectDragSource,
    removeStrategy,
    editStrategy,
}) => {
    const styles = useStyles();

    return (
        <CardHeader
            classes={{
                root: styles.strategyCardHeader,
                content: styles.strategyCardHeaderContent,
            }}
            title={
                <>
                    <Typography
                        variant="subtitle1"
                        className={styles.strategyCardHeaderTitle}
                    >
                        {name}
                    </Typography>
                    <div className={styles.strategyCardHeaderActions}>
                        <Tooltip title="Edit strategy">
                            <IconButton onClick={editStrategy}>
                                <Icon className={styles.strateyCardHeaderIcon}>
                                    edit
                                </Icon>
                            </IconButton>
                        </Tooltip>
                        {connectDragSource(
                            <span>
                                <Tooltip title="Drag and drop strategy to reorder. This only affects the order of which your strategies are evaluated.">
                                    <IconButton>
                                        <ReorderIcon />
                                    </IconButton>
                                </Tooltip>
                            </span>
                        )}
                        <Tooltip title="Delete strategy">
                            <IconButton onClick={removeStrategy}>
                                <Icon className={styles.strateyCardHeaderIcon}>
                                    delete
                                </Icon>
                            </IconButton>
                        </Tooltip>
                    </div>
                </>
            }
            disableTypography
        />
    );
};

StrategyCardHeader.propTypes = {
    name: PropTypes.string.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    removeStrategy: PropTypes.func.isRequired,
    editStrategy: PropTypes.func.isRequired,
};

export default StrategyCardHeader;
