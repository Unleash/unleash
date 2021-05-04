import React from 'react';
import PageContent from '../../../common/PageContent/PageContent';
import {
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
} from '@material-ui/core';
import ConditionallyRender from '../../../common/ConditionallyRender/ConditionallyRender';
import { CREATE_ADDON } from '../../../AccessProvider/permissions';
import PropTypes from 'prop-types';

const AvailableAddons = ({ providers, getIcon, hasAccess, history }) => {
    const renderProvider = provider => (
        <ListItem key={provider.name}>
            <ListItemAvatar>{getIcon(provider.name)}</ListItemAvatar>
            <ListItemText
                primary={provider.displayName}
                secondary={provider.description}
            />
            <ListItemSecondaryAction>
                <ConditionallyRender
                    condition={hasAccess(CREATE_ADDON)}
                    show={
                        <Button
                            variant="contained"
                            name="device_hub"
                            onClick={() =>
                                history.push(`/addons/create/${provider.name}`)
                            }
                            title="Configure"
                        >
                            Configure
                        </Button>
                    }
                />
            </ListItemSecondaryAction>
        </ListItem>
    );
    return (
        <PageContent headerContent="Available addons">
            <List>{providers.map(provider => renderProvider(provider))}</List>
        </PageContent>
    );
};

AvailableAddons.propTypes = {
    providers: PropTypes.array.isRequired,
    getIcon: PropTypes.func.isRequired,
    hasAccess: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default AvailableAddons;
