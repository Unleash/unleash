import type { ReactNode } from 'react';
import { Avatar, styled } from '@mui/material';
import DeviceHub from '@mui/icons-material/DeviceHub';
import { formatAssetPath } from 'utils/formatPath';
import { capitalizeFirst } from 'utils/capitalizeFirst';

import dataDogIcon from 'assets/icons/datadog.svg';
import newRelicIcon from 'assets/icons/new-relic.svg';
import jiraIcon from 'assets/icons/jira.svg';
import jiraCommentIcon from 'assets/icons/jira-comment.svg';
import signals from 'assets/icons/signals.svg';
import terraformIcon from 'assets/icons/terraform.svg';
import slackIcon from 'assets/icons/slack.svg';
import teamsIcon from 'assets/icons/teams.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import unleashIcon from 'assets/icons/unleash-integration.svg';
import android from 'assets/icons/sdks/Logo-android.svg';
import dotnet from 'assets/icons/sdks/Logo-net.svg';
import flutter from 'assets/icons/sdks/Logo-flutter.svg';
import go from 'assets/icons/sdks/Logo-go.svg';
import swift from 'assets/icons/sdks/Logo-swift.svg';
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

interface IIntegrationIconProps {
    name: string;
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    background: 'transparent',
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: '28px',
}));

const integrations: Record<
    string,
    {
        icon: string | ReactNode;
        title: string;
    }
> = {
    datadog: { title: 'Datadog', icon: dataDogIcon },
    'new-relic': { title: 'New Relic', icon: newRelicIcon },
    jira: { title: 'Jira', icon: jiraIcon },
    'jira-comment': { title: 'Jira', icon: jiraCommentIcon },
    signals: { title: 'Signals', icon: signals },
    terraform: { title: 'Terraform', icon: terraformIcon },
    slack: { title: 'Slack', icon: slackIcon },
    'slack-app': { title: 'Slack', icon: slackIcon },
    teams: { title: 'Teams', icon: teamsIcon },
    webhook: { title: 'Webhook', icon: webhooksIcon },
    unleash: { title: 'Unleash', icon: unleashIcon },
    android: { title: 'Android', icon: android },
    dotnet: { title: 'Dotnet', icon: dotnet },
    flutter: { title: 'Flutter', icon: flutter },
    go: { title: 'Go', icon: go },
    swift: { title: 'Swift', icon: swift },
    java: { title: 'Java', icon: java },
    javascript: { title: 'Javascript', icon: javascript },
    node: { title: 'Node', icon: node },
    php: { title: 'PHP', icon: php },
    python: { title: 'Python', icon: python },
    react: { title: 'React', icon: react },
    ruby: { title: 'Ruby', icon: ruby },
    rust: { title: 'Rust', icon: rust },
    svelte: { title: 'Svelte', icon: svelte },
    vue: { title: 'Vue', icon: vue },
};

export const IntegrationIcon = ({ name }: IIntegrationIconProps) => {
    const integration = integrations[name];

    if (!integration) {
        return (
            <StyledAvatar variant='rounded'>
                <DeviceHub />
            </StyledAvatar>
        );
    }

    if (typeof integration.icon === 'string') {
        return (
            <StyledAvatar
                src={formatAssetPath(integration.icon)}
                alt={`${capitalizeFirst(integration.title)} icon`}
                variant='rounded'
            />
        );
    }

    return (
        <StyledAvatar
            alt={`${capitalizeFirst(integration.title)} icon`}
            variant='rounded'
        >
            {integration.icon}
        </StyledAvatar>
    );
};
