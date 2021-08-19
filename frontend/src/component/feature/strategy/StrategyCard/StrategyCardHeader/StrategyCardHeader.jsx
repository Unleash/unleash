import React from 'react';
import PropTypes from 'prop-types';

import { CardHeader, Typography, IconButton, Tooltip } from '@material-ui/core';
import { Edit, Delete } from '@material-ui/icons';

import { useStyles } from './StrategyCardHeader.styles.js';
import { ReactComponent as ReorderIcon } from '../../../../../assets/icons/reorder.svg';
import ConditionallyRender from '../../../../common/ConditionallyRender/ConditionallyRender';

const StrategyCardHeader = ({
    name,
    connectDragSource,
    removeStrategy,
    editStrategy,
    disableDelete,
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
                    <Tooltip title={name}>
                        <Typography
                            variant="subtitle1"
                            className={styles.strategyCardHeaderTitle}
                        >
                            {name}
                        </Typography>
                    </Tooltip>
                    <div className={styles.strategyCardHeaderActions}>
                        <Tooltip title="Edit strategy">
                            <IconButton onClick={editStrategy}>
                                <Edit
                                    className={styles.strateyCardHeaderIcon}
                                />
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
                        <ConditionallyRender
                            condition={disableDelete}
                            show={
                                <Tooltip title="One strategy must always be applied. You can not delete this strategy.">
                                    <span>
                                        <IconButton
                                            onClick={removeStrategy}
                                            disabled={disableDelete}
                                        >
                                            <Delete
                                                className={
                                                    styles.strateyCardHeaderIcon
                                                }
                                            />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            }
                            elseShow={
                                <Tooltip title="Delete strategy">
                                    <IconButton onClick={removeStrategy}>
                                        <Delete
                                            className={
                                                styles.strateyCardHeaderIcon
                                            }
                                        />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
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
