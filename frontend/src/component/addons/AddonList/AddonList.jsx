import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import ConfiguredAddons from './ConfiguredAddons';
import AvailableAddons from './AvailableAddons';
import { Avatar, Icon } from '@material-ui/core';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';
import AccessContext from '../../../contexts/AccessContext';

const style = {
    width: '40px',
    height: '40px',
    marginRight: '16px',
    float: 'left',
};

const getIcon = name => {
    switch (name) {
        case 'slack':
            return <img style={style} alt="Slack Logo" src="slack.svg" />;
        case 'jira-comment':
            return <img style={style} alt="JIRA Logo" src="jira.svg" />;
        case 'webhook':
            return <img style={style} alt="Generic Webhook logo" src="webhooks.svg" />;
        default:
            return (
                <Avatar>
                    <Icon>device_hub</Icon>
                </Avatar>
            );
    }
};

const AddonList = ({ addons, providers, fetchAddons, removeAddon, toggleAddon, history }) => {
    const { hasAccess } = useContext(AccessContext);
    useEffect(() => {
        if (addons.length === 0) {
            fetchAddons();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addons.length]);

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={
                    <ConfiguredAddons
                        addons={addons}
                        toggleAddon={toggleAddon}
                        hasAccess={hasAccess}
                        removeAddon={removeAddon}
                        getIcon={getIcon}
                    />
                }
            />

            <br />
            <AvailableAddons providers={providers} hasAccess={hasAccess} history={history} getIcon={getIcon} />
        </>
    );
};

AddonList.propTypes = {
    addons: PropTypes.array.isRequired,
    providers: PropTypes.array.isRequired,
    fetchAddons: PropTypes.func.isRequired,
    removeAddon: PropTypes.func.isRequired,
    toggleAddon: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

export default AddonList;
