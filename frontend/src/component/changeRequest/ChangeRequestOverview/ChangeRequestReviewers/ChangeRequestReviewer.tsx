import { Box, styled, Typography } from '@mui/material';
import React, { FC } from 'react';
import { StyledAvatar } from '../ChangeRequestHeader/ChangeRequestHeader.styles';
import { CheckCircle } from '@mui/icons-material';

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

export const ChangeRequestReviewer: FC<IChangeRequestReviewerProps> = ({
    name,
    imageUrl,
}) => {
    return (
        <StyledBox>
            <StyledAvatar src={imageUrl} />
            <Typography
                variant="body1"
                color="text.primary"
                sx={{
                    maxWidth: '170px',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                }}
            >
                {name}
            </Typography>
            <StyledSuccessIcon />
        </StyledBox>
    );
};
