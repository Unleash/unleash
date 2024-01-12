import { Box } from '@mui/material';
import { FC, useState } from 'react';
import { Typography, Tooltip } from '@mui/material';
import TimeAgo from 'react-timeago';
import { ChangeRequestType } from 'component/changeRequest/changeRequest.types';
import { ChangeRequestStatusBadge } from 'component/changeRequest/ChangeRequestStatusBadge/ChangeRequestStatusBadge';
import {
    StyledPaper,
    StyledHeader,
    StyledInnerContainer,
    StyledAvatar,
    StyledCard,
} from './ChangeRequestHeader.styles';
import { Separator } from '../../ChangeRequestSidebar/ChangeRequestSidebar';
import { ChangeRequestTitle } from '../../ChangeRequestSidebar/EnvironmentChangeRequest/ChangeRequestTitle';
import { UpdateCount } from 'component/changeRequest/UpdateCount';

export const ChangeRequestHeader: FC<{ changeRequest: ChangeRequestType }> = ({
    changeRequest,
}) => {
    const [title, setTitle] = useState(changeRequest.title);
    return (
        <StyledPaper elevation={0}>
            <ChangeRequestTitle
                environmentChangeRequest={changeRequest}
                title={title}
                setTitle={setTitle}
            >
                <StyledHeader variant='h1' sx={{ mr: 1.5 }}>
                    {title}
                </StyledHeader>
            </ChangeRequestTitle>
            <StyledInnerContainer>
                <ChangeRequestStatusBadge changeRequest={changeRequest} />
                <Typography
                    variant='body2'
                    sx={(theme) => ({
                        margin: theme.spacing('auto', 0, 'auto', 2),
                    })}
                >
                    Created{' '}
                    <TimeAgo
                        minPeriod={60}
                        date={new Date(changeRequest.createdAt)}
                    />{' '}
                    by
                </Typography>
                <Box
                    sx={(theme) => ({
                        marginLeft: theme.spacing(1),
                    })}
                >
                    <Tooltip title={changeRequest?.createdBy?.username}>
                        <StyledAvatar
                            src={changeRequest?.createdBy?.imageUrl}
                        />
                    </Tooltip>
                </Box>
                <Typography
                    variant='body2'
                    sx={(theme) => ({ marginLeft: theme.spacing(0.5) })}
                >
                    {changeRequest?.createdBy?.username}
                </Typography>
                <Box sx={(theme) => ({ marginLeft: theme.spacing(1.5) })}>
                    <StyledCard variant='outlined'>
                        <Typography variant='body2' sx={{ lineHeight: 1 }}>
                            Environment:{' '}
                            <Typography
                                display='inline'
                                fontWeight='bold'
                                variant='body2'
                                component='span'
                            >
                                {changeRequest?.environment}
                            </Typography>{' '}
                            <Separator />
                            Updates:
                            <UpdateCount
                                featuresCount={changeRequest.features.length}
                                segmentsCount={changeRequest.segments.length}
                            />
                        </Typography>
                    </StyledCard>
                </Box>
            </StyledInnerContainer>
        </StyledPaper>
    );
};
