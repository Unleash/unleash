import React, { ReactElement } from 'react';
import { ConfiguredAddons } from './ConfiguredAddons/ConfiguredAddons';
import { AvailableAddons } from './AvailableAddons/AvailableAddons';
import { Avatar } from '@material-ui/core';
import { DeviceHub } from '@material-ui/icons';
import ConditionallyRender from 'component/common/ConditionallyRender/ConditionallyRender';
import slackIcon from 'assets/icons/slack.svg';
import jiraIcon from 'assets/icons/jira.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import teamsIcon from 'assets/icons/teams.svg';
import dataDogIcon from 'assets/icons/datadog.svg';
import { formatAssetPath } from 'utils/formatPath';
import useAddons from 'hooks/api/getters/useAddons/useAddons';

const style: React.CSSProperties = {
    width: '40px',
    height: '40px',
    marginRight: '16px',
    float: 'left',
};

const getAddonIcon = (name: string): ReactElement => {
    switch (name) {
        case 'slack':
            return (
                <img
                    style={style}
                    alt="Slack logo"
                    src={formatAssetPath(slackIcon)}
                />
            );
        case 'jira-comment':
            return (
                <img
                    style={style}
                    alt="JIRA logo"
                    src={formatAssetPath(jiraIcon)}
                />
            );
        case 'webhook':
            return (
                <img
                    style={style}
                    alt="Generic Webhook logo"
                    src={formatAssetPath(webhooksIcon)}
                />
            );
        case 'teams':
            return (
                <img
                    style={style}
                    alt="Microsoft Teams logo"
                    src={formatAssetPath(teamsIcon)}
                />
            );
        case 'datadog':
            return (
                <img
                    style={style}
                    alt="Datadog logo"
                    src={formatAssetPath(dataDogIcon)}
                />
            );
        default:
            return (
                <Avatar>
                    <DeviceHub />
                </Avatar>
            );
    }
};

export const AddonList = () => {
    const { providers, addons } = useAddons();

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={<ConfiguredAddons getAddonIcon={getAddonIcon} />}
            />

            <br />
            <AvailableAddons
                providers={providers}
                getAddonIcon={getAddonIcon}
            />
        </>
    );
};
