import { Avatar, Box, Link, styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import { IActionSet } from 'interfaces/action';
import { ISignalEndpoint } from 'interfaces/signal';
import { Link as RouterLink } from 'react-router-dom';
import { ComponentType } from 'react';
import { wrapperStyles } from 'component/common/Table/cells/LinkCell/LinkCell.styles';
import { SignalsIcon } from 'component/integrations/IntegrationList/IntegrationIcon/IntegrationIcon';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

const StyledCell = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

const StyledIcon = styled(Avatar)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    width: theme.spacing(3),
    height: theme.spacing(3),
    fontSize: theme.fontSizes.mainHeader,
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

interface IProjectActionsSourceCellProps {
    action: IActionSet;
    signalEndpoints: ISignalEndpoint[];
}

export const ProjectActionsSourceCell = ({
    action,
    signalEndpoints,
}: IProjectActionsSourceCellProps) => {
    const { sourceId, source } = action.match;

    if (source === 'signal-endpoint') {
        const signalEndpoint = signalEndpoints.find(
            ({ id }) => id === sourceId,
        );

        if (signalEndpoint) {
            return (
                <TextCell>
                    <StyledCell>
                        <HtmlTooltip title='Signal endpoint' arrow>
                            <StyledIcon alt='Signal endpoint' variant='rounded'>
                                <SignalsIcon />
                            </StyledIcon>
                        </HtmlTooltip>
                        <StyledLink
                            component={RouterLink}
                            to='/integrations/signals'
                            underline='hover'
                        >
                            {signalEndpoint.name}
                        </StyledLink>
                    </StyledCell>
                </TextCell>
            );
        }
    }

    return <TextCell>No source</TextCell>;
};
