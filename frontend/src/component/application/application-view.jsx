import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Grid, List, ListItem, ListItemText, ListItemAvatar, Switch, Icon, Typography } from '@material-ui/core';
import { shorten } from '../common';
import { CREATE_FEATURE, CREATE_STRATEGY } from '../../permissions';
import ConditionallyRender from '../common/ConditionallyRender/ConditionallyRender';

function ApplicationView({ seenToggles, hasPermission, strategies, instances, formatFullDateTime }) {
    const notFoundListItem = ({ createUrl, name, permission }) => (
        <ConditionallyRender
            key={`not_found_conditional_${name}`}
            condition={hasPermission(permission)}
            show={
                <ListItem key={`not_found_${name}`}>
                    <ListItemAvatar>
                        <Icon>report</Icon>
                    </ListItemAvatar>
                    <ListItemText
                        primary={<Link to={`${createUrl}?name=${name}`}>{name}</Link>}
                        secondary={'Missing, want to create?'}
                    />
                </ListItem>
            }
            elseShow={
                <ListItem key={`not_found_${name}`}>
                    <ListItemAvatar>
                        <Icon>report</Icon>
                    </ListItemAvatar>
                    <ListItemText primary={name} secondary={`Could not find feature toggle with name ${name}`} />
                </ListItem>
            }
        />
    );

    // eslint-disable-next-line react/prop-types
    const foundListItem = ({ viewUrl, name, showSwitch, enabled, description, i }) => (
        <ListItem key={`found_${name}-${i}`}>
            <ListItemAvatar>
                <ConditionallyRender
                    key={`conditional_avatar_${name}`}
                    condition={showSwitch}
                    show={<Switch disabled value={!!enabled} />}
                    elseShow={<Icon>extension</Icon>}
                />
            </ListItemAvatar>
            <ListItemText
                primary={<Link to={`${viewUrl}/${name}`}>{shorten(name, 50)}</Link>}
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
                    {seenToggles.map(({ name, description, enabled, notFound }, i) => (
                        <ConditionallyRender
                            key={`toggle_conditional_${name}`}
                            condition={notFound}
                            show={notFoundListItem({
                                createUrl: '/features/create',
                                name,
                                permission: CREATE_FEATURE,
                                i,
                            })}
                            elseShow={foundListItem({
                                viewUrl: '/features/strategies',
                                name,
                                showSwitch: true,
                                enabled,
                                description,
                                i,
                            })}
                        />
                    ))}
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
                                showSwitch: false,
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
                    {instances.map(({ instanceId, clientIp, lastSeen, sdkVersion }) => (
                        <ListItem key={`${instanceId}`}>
                            <ListItemAvatar>
                                <Icon>timeline</Icon>
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
                                        {clientIp} last seen at <small>{formatFullDateTime(lastSeen)}</small>
                                    </span>
                                }
                            />
                        </ListItem>
                    ))}
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
    hasPermission: PropTypes.func.isRequired,
    formatFullDateTime: PropTypes.func.isRequired,
};

export default ApplicationView;
