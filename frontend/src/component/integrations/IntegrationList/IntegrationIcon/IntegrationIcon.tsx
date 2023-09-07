import { Avatar } from '@mui/material';
import { DeviceHub } from '@mui/icons-material';
import { formatAssetPath } from 'utils/formatPath';

import slackIcon from 'assets/icons/slack.svg';
import jiraCommentIcon from 'assets/icons/jira-comment.svg';
import jiraIcon from 'assets/icons/jira.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import teamsIcon from 'assets/icons/teams.svg';
import dataDogIcon from 'assets/icons/datadog.svg';

import android from 'assets/icons/sdks/Logo-android.svg';
import dotnet from 'assets/icons/sdks/Logo-net.svg';
import flutter from 'assets/icons/sdks/Logo-flutter.svg';
import go from 'assets/icons/sdks/Logo-go.svg';
import ios from 'assets/icons/sdks/Logo-ios.svg';
import java from 'assets/icons/sdks/Logo-java.svg';
import javascript from 'assets/icons/sdks/Logo-javascript.svg';
import node from 'assets/icons/sdks/Logo-node.svg';
import php from 'assets/icons/sdks/Logo-php.svg';
import python from 'assets/icons/sdks/Logo-python.svg';
import react from 'assets/icons/sdks/Logo-react.svg';
import ruby from 'assets/icons/sdks/Logo-ruby.svg';
import rust from 'assets/icons/sdks/Logo-rust.svg';
import svelte from 'assets/icons/sdks/Logo-svelte.svg';
import vue from 'assets/icons/sdks/Logo-vue.svg';

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
        case 'android':
            return (
                <img
                    style={style}
                    alt="Android logo"
                    src={formatAssetPath(android)}
                />
            );
        case 'dotnet':
            return (
                <img
                    style={style}
                    alt=".Net logo"
                    src={formatAssetPath(dotnet)}
                />
            );
        case 'flutter':
            return (
                <img
                    style={style}
                    alt="Flutter logo"
                    src={formatAssetPath(flutter)}
                />
            );
        case 'go':
            return (
                <img style={style} alt="Go logo" src={formatAssetPath(go)} />
            );
        case 'ios':
            return (
                <img style={style} alt="iOS logo" src={formatAssetPath(ios)} />
            );
        case 'java':
            return (
                <img
                    style={style}
                    alt="Java logo"
                    src={formatAssetPath(java)}
                />
            );
        case 'javascript':
            return (
                <img
                    style={style}
                    alt="JavaScript logo"
                    src={formatAssetPath(javascript)}
                />
            );
        case 'node':
            return (
                <img
                    style={style}
                    alt="Node.js logo"
                    src={formatAssetPath(node)}
                />
            );
        case 'php':
            return (
                <img style={style} alt="PHP logo" src={formatAssetPath(php)} />
            );
        case 'python':
            return (
                <img
                    style={style}
                    alt="Python logo"
                    src={formatAssetPath(python)}
                />
            );
        case 'react':
            return (
                <img
                    style={style}
                    alt="React logo"
                    src={formatAssetPath(react)}
                />
            );
        case 'ruby':
            return (
                <img
                    style={style}
                    alt="Ruby logo"
                    src={formatAssetPath(ruby)}
                />
            );
        case 'rust':
            return (
                <img
                    style={style}
                    alt="Rust logo"
                    src={formatAssetPath(rust)}
                />
            );
        case 'svelte':
            return (
                <img
                    style={style}
                    alt="Svelte logo"
                    src={formatAssetPath(svelte)}
                />
            );
        case 'vue':
            return (
                <img style={style} alt="Vue logo" src={formatAssetPath(vue)} />
            );
        default:
            return (
                <Avatar>
                    <DeviceHub />
                </Avatar>
            );
    }
};
