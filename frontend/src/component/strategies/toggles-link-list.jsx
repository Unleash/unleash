import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import { PlayArrow, Pause } from '@material-ui/icons';

import styles from '../common/common.module.scss';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

export const TogglesLinkList = ({ toggles }) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
        <ConditionallyRender
            condition={toggles.length > 0}
            show={toggles.map(({ name, description = '-', enabled }) => (
                <ListItem key={name}>
                    <Tooltip title={enabled ? 'Enabled' : 'Disabled'}>
                        <ListItemAvatar>
                            {enabled ? <PlayArrow /> : <Pause />}
                        </ListItemAvatar>
                    </Tooltip>
                    <ListItemText
                        primary={
                            <Link key={name} to={`/features/view/${name}`}>
                                {name}
                            </Link>
                        }
                        secondary={description}
                    />
                </ListItem>
            ))}
        />
    </List>
);
TogglesLinkList.propTypes = {
    toggles: PropTypes.array,
};
