import { styled, Typography } from '@mui/material';

import { formatAssetPath } from '../../../utils/formatPath';
import { FC } from 'react';

export const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    flexDirection: 'column',
}));
export const StyledTitle = styled(Typography)({
    fontWeight: 'bold',
});

export const StyledImg = styled('img')({
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
});

interface JiraIntegrationProps {
    title: string;
    description: string;
    src: string;
}

export const JiraImageContainer: FC<JiraIntegrationProps> = ({
    title,
    description,
    src,
}) => {
    return (
        <StyledContainer>
            <StyledTitle>{title}</StyledTitle>
            <Typography>{description}</Typography>
            <StyledImg src={formatAssetPath(src)} />
        </StyledContainer>
    );
};
