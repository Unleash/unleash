import { Box, styled, Typography } from '@mui/material';
import type { FC } from 'react';
import { StyledAvatar } from '../ChangeRequestHeader/ChangeRequestHeader.styles';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
interface IChangeRequestReviewerProps {
    name?: string;
    imageUrl?: string;
}

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing(1.5),
    gap: theme.spacing(1),
}));

export const StyledSuccessIcon = styled(CheckCircle)(({ theme }) => ({
    color: theme.palette.success.main,
    marginLeft: 'auto',
}));

export const StyledErrorIcon = styled(Cancel)(({ theme }) => ({
    color: theme.palette.error.main,
    marginLeft: 'auto',
}));

export const ReviewerName = styled(Typography)({
    maxWidth: '170px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: 'text.primary',
});

export const ChangeRequestApprover: FC<IChangeRequestReviewerProps> = ({
    name,
    imageUrl,
}) => {
    return (
        <StyledBox>
            <StyledAvatar user={{ name, imageUrl }} />
            <ReviewerName variant='body1'>{name}</ReviewerName>
            <StyledSuccessIcon />
        </StyledBox>
    );
};

export const ChangeRequestRejector: FC<IChangeRequestReviewerProps> = ({
    name,
    imageUrl,
}) => {
    return (
        <StyledBox>
            <StyledAvatar user={{ name, imageUrl }} />
            <ReviewerName variant='body1'>{name}</ReviewerName>
            <StyledErrorIcon />
        </StyledBox>
    );
};
