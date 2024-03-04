import { ReactNode } from 'react';
import { Avatar, Icon, styled } from '@mui/material';
import { DeviceHub } from '@mui/icons-material';
import { formatAssetPath } from 'utils/formatPath';
import { capitalizeFirst } from 'utils/capitalizeFirst';

import slackIcon from 'assets/icons/slack.svg';
import jiraCommentIcon from 'assets/icons/jira-comment.svg';
import jiraIcon from 'assets/icons/jira.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import teamsIcon from 'assets/icons/teams.svg';
import dataDogIcon from 'assets/icons/datadog.svg';
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
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(4),
    height: theme.spacing(4),
    fontSize: '28px',
}));

const StyledCustomIcon = styled(Icon)({
    '&&&': {
        display: 'flex',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 'inherit',
    },
});

const StyledSignalsIcon = styled(StyledCustomIcon)(({ theme }) => ({
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
}));

const signalsIcon = <StyledSignalsIcon>sensors</StyledSignalsIcon>;
export const SignalsIcon = () => signalsIcon;

const integrations: Record<
    string,
    {
        icon: string | ReactNode;
        title: string;
    }
> = {
    slack: { title: 'Slack', icon: slackIcon },
    'slack-app': { title: 'Slack', icon: slackIcon },
    'jira-comment': { title: 'Jira', icon: jiraCommentIcon },
    webhook: { title: 'Webhook', icon: webhooksIcon },
    teams: { title: 'Teams', icon: teamsIcon },
    datadog: { title: 'Datadog', icon: dataDogIcon },
    jira: { title: 'Jira', icon: jiraIcon },
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
    signals: {
        title: 'Signals',
        icon: signalsIcon,
    },
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
