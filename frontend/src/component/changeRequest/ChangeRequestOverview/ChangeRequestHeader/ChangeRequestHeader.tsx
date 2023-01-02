import { Box } from '@mui/material';
import { FC } from 'react';
import { Typography, Tooltip } from '@mui/material';
import TimeAgo from 'react-timeago';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import { ChangeRequestStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestStatusBadge';
import {
    StyledPaper,
    StyledContainer,
    StyledHeader,
    StyledInnerContainer,
    StyledAvatar,
    StyledCard,
} from './ChangeRequestHeader.styles';
import { Separator } from '../../ChangeRequestSidebar/ChangeRequestSidebar';

export const ChangeRequestHeader: FC<{ changeRequest: IChangeRequest }> = ({
    changeRequest,
}) => {
    return (
        <StyledPaper elevation={0}>
            <StyledContainer>
                <StyledHeader variant="h1" sx={{ mr: 1.5 }}>
                    Change request #{changeRequest.id}
                </StyledHeader>
                <ChangeRequestStatusBadge state={changeRequest.state} />
            </StyledContainer>
            <StyledInnerContainer>
                <Typography variant="body2" sx={{ margin: 'auto 0' }}>
                    Created{' '}
                    <TimeAgo
                        minPeriod={60}
                        date={new Date(changeRequest.createdAt)}
                    />{' '}
                    by
                </Typography>
                <Box
                    sx={theme => ({
                        marginLeft: theme.spacing(1),
                    })}
                >
                    <Tooltip title={changeRequest?.createdBy?.username}>
                        <StyledAvatar
                            src={changeRequest?.createdBy?.imageUrl}
                        />
                    </Tooltip>
                </Box>
                <Box sx={theme => ({ marginLeft: theme.spacing(1.5) })}>
                    <StyledCard variant="outlined">
                        <Typography variant="body2" sx={{ lineHeight: 1 }}>
                            Environment:{' '}
                            <Typography
                                display="inline"
                                fontWeight="bold"
                                variant="body2"
                                component="span"
                            >
                                {changeRequest?.environment}
                            </Typography>{' '}
                            <Separator /> Updates:{' '}
                            <Typography
                                variant="body2"
                                display="inline"
                                fontWeight="bold"
                                component="span"
                            >
                                {changeRequest.features.length}{' '}
                                {changeRequest.features.length === 1
                                    ? 'feature toggle'
                                    : 'feature toggles'}
                            </Typography>
                        </Typography>
                    </StyledCard>
                </Box>
            </StyledInnerContainer>
        </StyledPaper>
    );
};
