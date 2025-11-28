import { styled } from '@mui/material';

import { ReactComponent as NewFeatureIcon } from 'assets/icons/new-feature-badge.svg';

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
