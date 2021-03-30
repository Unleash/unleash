import { Icon, List, ListItem, ListItemAvatar, ListItemText, Tooltip } from '@material-ui/core';
import styles from '../common/common.module.scss';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

export const TogglesLinkList = ({ toggles }) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
        <ConditionallyRender
            condition={toggles.length > 0}
            show={toggles.map(({ name, description = '-', enabled, icon = enabled ? 'play_arrow' : 'pause' }) => (
                <ListItem key={name}>
                    <Tooltip title={enabled ? 'Enabled' : 'Disabled'}>
                        <ListItemAvatar>
                            <Icon>{icon}</Icon>
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
