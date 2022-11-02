import { Box } from '@mui/material';
import { FC } from 'react';
import { Typography } from '@mui/material';
import TimeAgo from 'react-timeago';
import { resolveChangeRequestStatusIcon } from 'component/changeRequest/changeRequest.utils';
import { IChangeRequest } from 'component/changeRequest/changeRequest.types';
import {
    StyledPaper,
    StyledContainer,
    StyledHeader,
    StyledInnerContainer,
    StyledAvatar,
    StyledCard,
} from './ChangeRequestHeader.styles';

export const ChangeRequestHeader: FC<{ changeRequest: IChangeRequest }> = ({
    changeRequest,
}) => {
    return (
        <StyledPaper elevation={0}>
            <StyledContainer>
                <StyledHeader variant="h1">
                    Change request #{changeRequest.id}
                </StyledHeader>
                {resolveChangeRequestStatusIcon(changeRequest.state)}
            </StyledContainer>
            <StyledInnerContainer>
                <Typography variant="body2" sx={{ margin: 'auto 0' }}>
                    Created <TimeAgo date={new Date(changeRequest.createdAt)} />{' '}
                    by
                </Typography>
                <StyledAvatar src={changeRequest?.createdBy?.imageUrl} />
                <Box>
                    <StyledCard variant="outlined">
                        <Typography variant="body2">
                            Environment:{' '}
                            <Typography
                                display="inline"
                                fontWeight="bold"
                                variant="body2"
                            >
                                {changeRequest?.environment}
                            </Typography>{' '}
                            | Updates:{' '}
                            <Typography
                                variant="body2"
                                display="inline"
                                fontWeight="bold"
                            >
                                {changeRequest?.features.length} feature toggles
                            </Typography>
                        </Typography>
                    </StyledCard>
                </Box>
            </StyledInnerContainer>
        </StyledPaper>
    );
};
