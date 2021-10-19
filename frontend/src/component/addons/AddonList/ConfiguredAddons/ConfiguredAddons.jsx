import React from 'react';
import {
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
} from '@material-ui/core';
import { Visibility, VisibilityOff, Delete } from '@material-ui/icons';

import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';
import {
    DELETE_ADDON,
    UPDATE_ADDON,
} from '../../../providers/AccessProvider/permissions';
import { Link } from 'react-router-dom';
import PageContent from '../../../common/PageContent/PageContent';
import PropTypes from 'prop-types';

const ConfiguredAddons = ({
    addons,
    hasAccess,
    removeAddon,
    getIcon,
    toggleAddon,
}) => {
    const onRemoveAddon = addon => () => removeAddon(addon);
    const renderAddon = addon => (
        <ListItem key={addon.id}>
            <ListItemAvatar>{getIcon(addon.provider)}</ListItemAvatar>
            <ListItemText
                primary={
                    <span>
                        <ConditionallyRender
                            condition={hasAccess(UPDATE_ADDON)}
                            show={
                                <Link
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                    }}
                                    to={`/addons/edit/${addon.id}`}
                                >
                                    <strong>{addon.provider}</strong>
                                </Link>
                            }
                            elseShow={<strong>{addon.provider}</strong>}
                        />
                        {addon.enabled ? null : <small> (Disabled)</small>}
                    </span>
                }
                secondary={addon.description}
            />
            <ListItemSecondaryAction>
                <ConditionallyRender
                    condition={hasAccess(UPDATE_ADDON)}
                    show={
                        <IconButton
                            size="small"
                            title={
                                addon.enabled ? 'Disable addon' : 'Enable addon'
                            }
                            onClick={() => toggleAddon(addon)}
                        >
                            <ConditionallyRender
                                condition={addon.enabled}
                                show={<Visibility />}
                                elseShow={<VisibilityOff />}
                            />
                        </IconButton>
                    }
                />
                <ConditionallyRender
                    condition={hasAccess(DELETE_ADDON)}
                    show={
                        <IconButton
                            size="small"
                            title="Remove addon"
                            onClick={onRemoveAddon(addon)}
                        >
                            <Delete />
                        </IconButton>
                    }
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
    return (
        <PageContent headerContent="Configured addons">
            <List>{addons.map(addon => renderAddon(addon))}</List>
        </PageContent>
    );
};
ConfiguredAddons.propTypes = {
    addons: PropTypes.array.isRequired,
    hasAccess: PropTypes.func.isRequired,
    removeAddon: PropTypes.func.isRequired,
    toggleAddon: PropTypes.func.isRequired,
    getIcon: PropTypes.func.isRequired,
};

export default ConfiguredAddons;
