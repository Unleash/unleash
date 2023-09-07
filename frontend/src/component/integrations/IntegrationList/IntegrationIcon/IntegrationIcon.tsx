import { Avatar, styled } from '@mui/material';
import { DeviceHub } from '@mui/icons-material';
import { formatAssetPath } from 'utils/formatPath';

import slackIcon from 'assets/icons/slack.svg';
import jiraCommentIcon from 'assets/icons/jira-comment.svg';
import jiraIcon from 'assets/icons/jira.svg';
import webhooksIcon from 'assets/icons/webhooks.svg';
import teamsIcon from 'assets/icons/teams.svg';
import dataDogIcon from 'assets/icons/datadog.svg';
import unleashIcon from 'assets/icons/unleash-integration.svg';
import { capitalizeFirst } from 'utils/capitalizeFirst';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(4),
    height: theme.spacing(4),
    // background: theme.palette.background.elevation1,
}));

interface IIntegrationIconProps {
    name: string;
}

const integrations: Record<string, string> = {
    slack: slackIcon,
    'slack-app': slackIcon,
    'jira-comment': jiraCommentIcon,
    webhook: webhooksIcon,
    teams: teamsIcon,
    datadog: dataDogIcon,
    jira: jiraIcon,
    unleash: unleashIcon,
};

export const IntegrationIcon = ({ name }: IIntegrationIconProps) => (
    <ConditionallyRender
        condition={Object.keys(integrations).includes(name)}
        show={() => (
            <StyledAvatar
                src={formatAssetPath(integrations[name])}
                alt={`${capitalizeFirst(name)} icon`}
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
