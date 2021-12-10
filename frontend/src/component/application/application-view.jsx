import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Typography,
} from '@material-ui/core';
import { Report, Extension, Timeline, FlagRounded } from '@material-ui/icons';

import { shorten } from '../common';
import {
    CREATE_FEATURE,
    CREATE_STRATEGY,
} from '../providers/AccessProvider/permissions';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';
import { getTogglePath } from '../../utils/route-path-helpers';
function ApplicationView({
    seenToggles,
    hasAccess,
    strategies,
    instances,
    formatFullDateTime,
}) {
    const notFoundListItem = ({ createUrl, name, permission }) => (
        <ConditionallyRender
            key={`not_found_conditional_${name}`}
            condition={hasAccess(permission)}
            show={
                <ListItem key={`not_found_${name}`}>
                    <ListItemAvatar>
                        <Report style={{color: 'red'}} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={<Link to={`${createUrl}`}>{name}</Link>}
                        secondary={'Missing, want to create?'}
                    />
                </ListItem>
            }
            elseShow={
                <ListItem key={`not_found_${name}`}>
                    <ListItemAvatar>
                        <Report />
                    </ListItemAvatar>
                    <ListItemText
                        primary={name}
                        secondary={`Could not find feature toggle with name ${name}`}
                    />
                </ListItem>
            }
        />
    );

    // eslint-disable-next-line react/prop-types
    const foundListItem = ({
        viewUrl,
        name,
        description,
        Icon,
        i,
    }) => (
        <ListItem key={`found_${name}-${i}`}>
            <ListItemAvatar>
                <Icon />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Link to={`${viewUrl}/${name}`}>{shorten(name, 50)}</Link>
                }
                secondary={shorten(description, 60)}
            />
        </ListItem>
    );
    return (
        <Grid container style={{ margin: 0 }}>
            <Grid item xl={6} md={6} xs={12}>
                <Typography variant="subtitle1" style={{ padding: '1rem 0' }}>
                    Toggles
                </Typography>
                <hr />
                <List>
                    {seenToggles.map(
                        (
                            { name, description, notFound, project },
                            i
                        ) => (
                            <ConditionallyRender
                                key={`toggle_conditional_${name}`}
                                condition={notFound}
                                show={notFoundListItem({
                                    createUrl: `/projects/default/create-toggle2?name=${name}`,
                                    name,
                                    permission: CREATE_FEATURE,
                                    i,
                                })}
                                elseShow={foundListItem({
                                    viewUrl: getTogglePath(project, name),
                                    name,
                                    description,
                                    Icon: FlagRounded,
                                    i,
                                })}
                            />
                        )
                    )}
                </List>
            </Grid>
            <Grid item xl={6} md={6} xs={12}>
                <Typography variant="subtitle1" style={{ padding: '1rem 0' }}>
                    Implemented strategies
                </Typography>
                <hr />
                <List>
                    {strategies.map(({ name, description, notFound }, i) => (
                        <ConditionallyRender
                            key={`strategies_conditional_${name}`}
                            condition={notFound}
                            show={notFoundListItem({
                                createUrl: '/strategies/create',
                                name,
                                permission: CREATE_STRATEGY,
                                i,
                            })}
                            elseShow={foundListItem({
                                viewUrl: '/strategies/view',
                                name,
                                Icon: Extension,
                                enabled: undefined,
                                description,
                                i,
                            })}
                        />
                    ))}
                </List>
            </Grid>
            <Grid item xl={12} md={12}>
                <Typography variant="subtitle1" style={{ padding: '1rem 0' }}>
                    {instances.length} Instances registered
                </Typography>
                <hr />
                <List>
                    {instances.map(
                        ({ instanceId, clientIp, lastSeen, sdkVersion }) => (
                            <ListItem key={`${instanceId}`}>
                                <ListItemAvatar>
                                    <Timeline />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <ConditionallyRender
                                            key={`${instanceId}_conditional`}
                                            condition={sdkVersion}
                                            show={`${instanceId} (${sdkVersion})`}
                                            elseShow={instanceId}
                                        />
                                    }
                                    secondary={
                                        <span>
                                            {clientIp} last seen at{' '}
                                            <small>
                                                {formatFullDateTime(lastSeen)}
                                            </small>
                                        </span>
                                    }
                                />
                            </ListItem>
                        )
                    )}
                </List>
            </Grid>
        </Grid>
    );
}

ApplicationView.propTypes = {
    createUrl: PropTypes.string,
    name: PropTypes.string,
    permission: PropTypes.string,
    instances: PropTypes.array.isRequired,
    seenToggles: PropTypes.array.isRequired,
    strategies: PropTypes.array.isRequired,
    hasAccess: PropTypes.func.isRequired,
    formatFullDateTime: PropTypes.func.isRequired,
};

export default ApplicationView;
