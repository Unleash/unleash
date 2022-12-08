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
                    Created <TimeAgo date={new Date(changeRequest.createdAt)} />{' '}
                    by
                </Typography>
                <Tooltip title={changeRequest?.createdBy?.username}>
                    <StyledAvatar src={changeRequest?.createdBy?.imageUrl} />
                </Tooltip>
                <Box sx={{ ml: 1.5 }}>
                    <StyledCard variant="outlined">
                        <Typography variant="body2">
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
