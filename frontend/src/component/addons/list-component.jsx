import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { List, ListItem, ListItemAction, IconButton, Card, Button } from 'react-mdl';
import { HeaderTitle, styles as commonStyles } from '../common';
import { CREATE_ADDON, DELETE_ADDON, UPDATE_ADDON } from '../../permissions';

const style = { width: '40px', height: '40px', marginRight: '16px', float: 'left' };

const getIcon = name => {
    switch (name) {
        case 'slack':
            return <img style={style} src="public/slack.svg" />;
        case 'jira-comment':
            return <img style={style} src="public/jira.svg" />;
        case 'webhook':
            return <img style={style} src="public/webhooks.svg" />;
        default:
            return <i className="material-icons mdl-list__item-avatar">device_hub</i>;
    }
};

const AddonListComponent = ({ addons, providers, fetchAddons, removeAddon, toggleAddon, history, hasPermission }) => {
    useEffect(() => {
        if (addons.length === 0) {
            fetchAddons();
        }
    }, []);

    const onRemoveAddon = addon => () => removeAddon(addon);

    return (
        <div>
            {addons.length > 0 ? (
                <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                    <HeaderTitle title="Configured addons" />
                    <List>
                        {addons.map(addon => (
                            <ListItem key={addon.id} threeLine>
                                <span className={['mdl-list__item-primary-content'].join(' ')}>
                                    {getIcon(addon.provider)}
                                    <span>
                                        {hasPermission(UPDATE_ADDON) ? (
                                            <Link to={`/addons/edit/${addon.id}`}>
                                                <strong>{addon.provider}</strong>
                                            </Link>
                                        ) : (
                                            <strong>{addon.provider}</strong>
                                        )}
                                        {addon.enabled ? null : <small> (Disabled)</small>}
                                    </span>
                                    <span className="mdl-list__item-text-body">{addon.description}</span>
                                </span>
                                <ListItemAction>
                                    {hasPermission(UPDATE_ADDON) ? (
                                        <IconButton
                                            name={addon.enabled ? 'visibility' : 'visibility_off'}
                                            title={addon.enabled ? 'Disable addon' : 'Enable addon'}
                                            onClick={() => toggleAddon(addon)}
                                        />
                                    ) : null}
                                    {hasPermission(DELETE_ADDON) ? (
                                        <IconButton name="delete" title="Remove addon" onClick={onRemoveAddon(addon)} />
                                    ) : null}
                                </ListItemAction>
                            </ListItem>
                        ))}
                    </List>
                </Card>
            ) : null}
            <br />
            <Card shadow={0} className={commonStyles.fullwidth} style={{ overflow: 'visible' }}>
                <HeaderTitle title="Available addons" />
                <List>
                    {providers.map((provider, i) => (
                        <ListItem key={i} threeLine>
                            <span className={['mdl-list__item-primary-content'].join(' ')}>
                                {getIcon(provider.name)}
                                <span>
                                    <strong>{provider.displayName}</strong>&nbsp;
                                </span>
                                <span className="mdl-list__item-text-body">{provider.description}</span>
                            </span>
                            <ListItemAction>
                                {hasPermission(CREATE_ADDON) ? (
                                    <Button
                                        raised
                                        colored
                                        name="device_hub"
                                        onClick={() => history.push(`/addons/create/${provider.name}`)}
                                        title="Configure"
                                    >
                                        Configure
                                    </Button>
                                ) : (
                                    ''
                                )}
                            </ListItemAction>
                        </ListItem>
                    ))}
                </List>
            </Card>
        </div>
    );
};
AddonListComponent.propTypes = {
    addons: PropTypes.array.isRequired,
    providers: PropTypes.array.isRequired,
    fetchAddons: PropTypes.func.isRequired,
    removeAddon: PropTypes.func.isRequired,
    toggleAddon: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    hasPermission: PropTypes.func.isRequired,
};

export default AddonListComponent;
