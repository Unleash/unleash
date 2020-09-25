import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Grid, Cell, List, ListItem, ListItemContent, Switch } from 'react-mdl';
import { shorten } from '../common';
import { CREATE_FEATURE, CREATE_STRATEGY } from '../../permissions';

function ApplicationView({ seenToggles, hasPermission, strategies, instances, formatFullDateTime }) {
    return (
        <Grid style={{ margin: 0 }}>
            <Cell col={6} tablet={4} phone={12} hidePhone>
                <h6> Toggles</h6>
                <hr />
                <List>
                    {seenToggles.map(({ name, description, enabled, notFound }, i) =>
                        notFound ? (
                            <ListItem twoLine key={i}>
                                {hasPermission(CREATE_FEATURE) ? (
                                    <ListItemContent icon={'report'} subtitle={'Missing, want to create?'}>
                                        <Link to={`/features/create?name=${name}`}>{name}</Link>
                                    </ListItemContent>
                                ) : (
                                    <ListItemContent icon={'report'} subtitle={'Missing'}>
                                        {name}
                                    </ListItemContent>
                                )}
                            </ListItem>
                        ) : (
                            <ListItem twoLine key={i}>
                                <ListItemContent
                                    icon={
                                        <span>
                                            <Switch disabled checked={!!enabled} />
                                        </span>
                                    }
                                    subtitle={shorten(description, 60)}
                                >
                                    <Link to={`/features/view/${name}`}>{shorten(name, 50)}</Link>
                                </ListItemContent>
                            </ListItem>
                        )
                    )}
                </List>
            </Cell>
            <Cell col={6} tablet={4} phone={12}>
                <h6>Implemented strategies</h6>
                <hr />
                <List>
                    {strategies.map(({ name, description, notFound }, i) =>
                        notFound ? (
                            <ListItem twoLine key={`${name}-${i}`}>
                                {hasPermission(CREATE_STRATEGY) ? (
                                    <ListItemContent icon={'report'} subtitle={'Missing, want to create?'}>
                                        <Link to={`/strategies/create?name=${name}`}>{name}</Link>
                                    </ListItemContent>
                                ) : (
                                    <ListItemContent icon={'report'} subtitle={'Missing'}>
                                        {name}
                                    </ListItemContent>
                                )}
                            </ListItem>
                        ) : (
                            <ListItem twoLine key={`${name}-${i}`}>
                                <ListItemContent icon={'extension'} subtitle={shorten(description, 60)}>
                                    <Link to={`/strategies/view/${name}`}>{shorten(name, 50)}</Link>
                                </ListItemContent>
                            </ListItem>
                        )
                    )}
                </List>
            </Cell>
            <Cell col={12} tablet={12}>
                <h6>{instances.length} Instances registered</h6>
                <hr />
                <List>
                    {instances.map(({ instanceId, clientIp, lastSeen, sdkVersion }, i) => (
                        <ListItem key={i} twoLine>
                            <ListItemContent
                                icon="timeline"
                                subtitle={
                                    <span>
                                        {clientIp} last seen at <small>{formatFullDateTime(lastSeen)}</small>
                                    </span>
                                }
                            >
                                {instanceId} {sdkVersion ? `(${sdkVersion})` : ''}
                            </ListItemContent>
                        </ListItem>
                    ))}
                </List>
            </Cell>
        </Grid>
    );
}

ApplicationView.propTypes = {
    instances: PropTypes.array.isRequired,
    seenToggles: PropTypes.array.isRequired,
    strategies: PropTypes.array.isRequired,
    hasPermission: PropTypes.func.isRequired,
    formatFullDateTime: PropTypes.func.isRequired,
};

export default ApplicationView;
