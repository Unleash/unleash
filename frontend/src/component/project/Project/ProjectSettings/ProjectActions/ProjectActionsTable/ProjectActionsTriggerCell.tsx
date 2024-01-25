import { Avatar, styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IActionSet } from 'interfaces/action';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import webhooksIcon from 'assets/icons/webhooks.svg';
import { Link as RouterLink } from 'react-router-dom';
import { StyledLink } from 'component/common/Table/cells/LinkCell/LinkCell.styles';

const StyledIcon = styled(Avatar)(({ theme }) => ({
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(4),
    height: theme.spacing(4),
}));

interface IProjectActionsTriggerCellProps {
    action: IActionSet;
    incomingWebhooks: IIncomingWebhook[];
}

export const ProjectActionsTriggerCell = ({
    action,
    incomingWebhooks,
}: IProjectActionsTriggerCellProps) => {
    const { sourceId } = action.match;
    const trigger = incomingWebhooks.find(({ id }) => id === sourceId);

    if (!trigger) {
        return <TextCell>No trigger</TextCell>;
    }

    return (
        <TextCell>
            <StyledIcon
                src={webhooksIcon}
                alt='Incoming webhook'
                variant='rounded'
            />
            <StyledLink
                component={RouterLink}
                to='/integrations/incoming-webhooks'
                underline='hover'
            >
                {trigger.name}
            </StyledLink>
        </TextCell>
    );
};
