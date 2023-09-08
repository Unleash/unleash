import { Avatar, styled } from '@mui/material';
import { DeviceHub } from '@mui/icons-material';
import { formatAssetPath } from 'utils/formatPath';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

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

interface IIntegrationIconProps {
    name: string;
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(4),
    height: theme.spacing(4),
}));

const integrations: Record<
    string,
    {
        icon: string;
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
    ios: { title: 'iOS', icon: ios },
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

export const IntegrationIcon = ({ name }: IIntegrationIconProps) => (
    <ConditionallyRender
        condition={Object.keys(integrations).includes(name)}
        show={() => (
            <StyledAvatar
                src={formatAssetPath(integrations[name].icon)}
                alt={`${capitalizeFirst(integrations[name].title)} icon`}
                variant="rounded"
            />
        )}
        elseShow={() => (
            <StyledAvatar variant="rounded">
                <DeviceHub />
            </StyledAvatar>
        )}
    />
);
