import { Avatar } from '@mui/material';
import { DeviceHub } from '@mui/icons-material';
import { formatAssetPath } from 'utils/formatPath';

import slackIcon from 'assets/icons/slack.svg';
import jiraCommentIcon from 'assets/icons/jira-comment.svg';
import jiraIcon from 'assets/icons/jira.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import teamsIcon from 'assets/icons/teams.svg';
import dataDogIcon from 'assets/icons/datadog.svg';

const style: React.CSSProperties = {
    width: '32.5px',
    height: '32.5px',
    marginRight: '16px',
};

interface IIntegrationIconProps {
    name: string;
}

export const IntegrationIcon = ({ name }: IIntegrationIconProps) => {
    switch (name) {
        case 'slack':
        case 'slack-app':
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
                    src={formatAssetPath(jiraCommentIcon)}
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
        case 'jira':
            return (
                <img
                    style={style}
                    alt="JIRA logo"
                    src={formatAssetPath(jiraIcon)}
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
