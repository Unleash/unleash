import { Avatar, Box, Link, styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IActionSet } from 'interfaces/action';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import webhooksIcon from 'assets/icons/webhooks.svg';
import { Link as RouterLink } from 'react-router-dom';
import { ComponentType } from 'react';
import { wrapperStyles } from 'component/common/Table/cells/LinkCell/LinkCell.styles';

const StyledCell = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

const StyledIcon = styled(Avatar)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(3),
    height: theme.spacing(3),
}));

const StyledLink = styled(Link)<{
    component?: ComponentType<any>;
    to?: string;
}>(({ theme }) => ({
    ...wrapperStyles(theme),
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
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
            <StyledCell>
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
            </StyledCell>
        </TextCell>
    );
};
