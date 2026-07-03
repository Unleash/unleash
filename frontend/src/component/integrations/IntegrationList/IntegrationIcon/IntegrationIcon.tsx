import { Avatar, styled } from '@mui/material';
import DeviceHub from '@mui/icons-material/DeviceHub';
import { formatAssetPath } from 'utils/formatPath';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { SDK_ICONS } from '../AvailableIntegrations/SDKs.ts';

import dataDogIcon from 'assets/icons/datadog.svg';
import newRelicIcon from 'assets/icons/new-relic.svg';
import jiraIcon from 'assets/icons/jira.svg';
import jiraCommentIcon from 'assets/icons/jira-comment.svg';
import signals from 'assets/icons/signals.svg';
import terraformIcon from 'assets/icons/terraform.svg';
import slackIcon from 'assets/icons/slack.svg';
import teamsIcon from 'assets/icons/teams.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import serviceNowIcon from 'assets/icons/servicenow.svg';
import unleashIcon from 'assets/icons/unleash-integration.svg';

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
    { icon: UnformattedAssetPath; title: string }
> = {
    datadog: { title: 'Datadog', icon: dataDogIcon },
    'new-relic': { title: 'New Relic', icon: newRelicIcon },
    jira: { title: 'Jira', icon: jiraIcon },
    'jira-comment': { title: 'Jira', icon: jiraCommentIcon },
    signals: { title: 'Signals', icon: signals },
    terraform: { title: 'Terraform', icon: terraformIcon },
    slack: { title: 'Slack', icon: slackIcon }, // TODO: remove this when all clients migrate to Slack App
    'slack-app': { title: 'Slack', icon: slackIcon },
    teams: { title: 'Teams', icon: teamsIcon },
    webhook: { title: 'Webhook', icon: webhooksIcon },
    servicenow: { title: 'ServiceNow', icon: serviceNowIcon },
    unleash: { title: 'Unleash', icon: unleashIcon },
    ...SDK_ICONS,
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

    return (
        <StyledAvatar
            src={formatAssetPath(integration.icon)}
            alt={`${capitalizeFirst(integration.title)} icon`}
            variant='rounded'
        />
    );
};
