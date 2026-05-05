import { styled } from '@mui/material';

import NewFeatureIcon from 'assets/icons/new-feature-badge.svg?react';

const StyledBadgeContainer = styled('span')({
    width: '24px',
    height: '24px',
    display: 'inline-block',
});

export const NewFeatureBadge = () => (
    <StyledBadgeContainer>
        <NewFeatureIcon />
    </StyledBadgeContainer>
);
