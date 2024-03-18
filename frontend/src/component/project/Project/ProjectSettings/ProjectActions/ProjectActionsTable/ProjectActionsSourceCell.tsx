import { Avatar, Box, Link, styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import type { IActionSet } from 'interfaces/action';
import type { ISignalEndpoint } from 'interfaces/signal';
import { Link as RouterLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { wrapperStyles } from 'component/common/Table/cells/LinkCell/LinkCell.styles';
import signals from 'assets/icons/signals.svg';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';
import { formatAssetPath } from 'utils/formatPath';

const StyledCell = styled(Box)({
    display: 'flex',
    alignItems: 'center',
});

const StyledIcon = styled(Avatar)(({ theme }) => ({
    background: 'transparent',
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
                            <StyledIcon
                                src={formatAssetPath(signals)}
                                alt='Signal endpoint'
                                variant='rounded'
                            />
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
